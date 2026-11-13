#!/usr/bin/env python3
"""Checks for the 你好パンチ site in this folder's parent.

Serves aaa/ the way Vercel does (root directory aaa) and checks that the
real meme files, the 3:1 banner, and the single 100% graphic are what the
page actually requests.
"""

import hashlib
import http.server
import json
import os
import re
import socketserver
import struct
import threading
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent

KUNGFU = ROOT / "assets/memes/kungfu-courtyard.png"
NEON = ROOT / "assets/memes/neon-arcade.png"
BANNER = ROOT / "assets/banner.png"
HTML = ROOT / "index.html"
SITE = ROOT / "site.json"

EXPECTED = {
    KUNGFU: "5cbbcfc8",
    NEON: "0f83e37c",
    BANNER: "7b27751a",
}


def sha8(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:8]


def png_size(path: Path):
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", path
    return struct.unpack(">II", data[16:24])


def visible_text(html: str) -> str:
    html = re.sub(r"<!--.*?-->", " ", html, flags=re.S)
    html = re.sub(r"<script\b.*?</script>", " ", html, flags=re.S)
    html = re.sub(r"<style\b.*?</style>", " ", html, flags=re.S)
    html = re.sub(r"<[^>]+>", " ", html)
    return html


def check_static():
    for path, digest in EXPECTED.items():
        assert path.is_file(), path
        assert sha8(path) == digest, (path, sha8(path))
    assert png_size(KUNGFU) == (1024, 1024)
    assert png_size(NEON) == (1024, 1024)
    assert png_size(BANNER) == (1800, 600)

    html = HTML.read_text(encoding="utf-8")
    assert "<base " not in html.lower()
    assert "assets/tpl/tok.webp" not in html
    assert "Supply: 1B" not in html
    assert "Tax: 0/0" not in html
    assert "Liquidity: Burned" not in html

    text = visible_text(html)
    assert "100% LP burnt" in text
    assert "LP mint supply is 0" in text
    assert "Other markets are not included" in text
    assert "982,860,062.088278" in text
    assert "This is not 1,000,000,000" in text
    assert "20%" not in text and "30%" not in text

    for name, digest in (
        ("assets/banner.png", "7b27751a"),
        ("assets/memes/kungfu-courtyard.png", "5cbbcfc8"),
        ("assets/memes/neon-arcade.png", "0f83e37c"),
    ):
        assert f'{name}?v={digest}' in html, name
        assert not html.count(f'src="{name}"')  # every use is cache-busted

    assert 'src="assets/logo.png?v=540d6786"' in html
    assert html.count('src="assets/memes/kungfu-courtyard.png?v=5cbbcfc8"') == 2
    assert html.count('src="assets/memes/neon-arcade.png?v=0f83e37c"') == 2
    gal = re.search(r'<div class="ck-gal ck-memes-real[^"]*" data-mx-keep>(.*?)</div>', html)
    assert gal, "meme gallery missing"
    assert gal.group(1).count("<img") == 2
    assert "logo.png" not in gal.group(1)
    assert 'class="lp-single"' in html
    assert 'class="no-count"' in html
    assert 'id="lpTitle">100% LP burnt' in html
    assert "https://nihaopunch.lol/assets/banner.png?v=7b27751a" in html

    site = json.loads(SITE.read_text(encoding="utf-8"))
    assert site["name"] == "你好パンチ"
    assert site["ticker"] == "punchhao"
    assert site["template"] == "c38-ocicat"
    assert site["chain"] == "solana"
    assert site["ca"] == "C5jaQ3sUjdKJLcyTS4tSnmj2PsiXkYWZXyA3gxm3pump"
    assert site["banner"] == "assets/banner.png"
    assert site["images"] == [
        "assets/memes/kungfu-courtyard.png",
        "assets/memes/neon-arcade.png",
    ]
    assert site["supply"] == ""
    assert site["tax"] == ""
    assert "supply 0" in site["lp"]
    for rel in [site["banner"], site["logo"], *site["images"]]:
        assert (ROOT / rel).is_file(), rel

    # Relative asset URLs resolve under whichever directory serves index.html.
    # Vercel uses root directory aaa, so assets/... is the site root.
    # A <base href="/"> would break a copy served from /aaa/.
    for rel in ("assets/banner.png", "assets/memes/kungfu-courtyard.png", "assets/memes/neon-arcade.png", "assets/logo.png"):
        assert (ROOT / rel).is_file()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):
        return


def check_http():
    server = socketserver.TCPServer(("127.0.0.1", 0), Handler)
    port = server.server_address[1]
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        base = f"http://127.0.0.1:{port}"
        page = urllib.request.urlopen(base + "/", timeout=10)
        body = page.read()
        assert page.status == 200
        assert b"kungfu-courtyard.png?v=5cbbcfc8" in body
        assert b"tok.webp" not in body
        for rel, path in (
            ("/assets/banner.png?v=7b27751a", BANNER),
            ("/assets/memes/kungfu-courtyard.png?v=5cbbcfc8", KUNGFU),
            ("/assets/memes/neon-arcade.png?v=0f83e37c", NEON),
            ("/assets/logo.png?v=540d6786", ROOT / "assets/logo.png"),
        ):
            res = urllib.request.urlopen(base + rel, timeout=10)
            data = res.read()
            assert res.status == 200, rel
            assert data == path.read_bytes(), rel
            assert hashlib.sha256(data).hexdigest()[:8] == sha8(path)
        print(f"http ok {base}")
    finally:
        server.shutdown()


def main():
    check_static()
    check_http()
    print("site checks passed")


if __name__ == "__main__":
    main()

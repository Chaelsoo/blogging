#!/usr/bin/env python3
"""
pull_writeup.py - Pull a writeup from Notion into the blogging repo structure

Usage:
    python pull_writeup.py <machine-name>
    python pull_writeup.py cicada
    python pull_writeup.py scrambled

Requires:
    - notion-sync installed globally (npm install -g notion-sync-cli)
    - notion-sync.config.json at repo root
    - NOTION_TOKEN in .env
    - HTB_TOKEN in .env (optional, for auto-fetching machine avatar)

Output:
    notion/raw/<slug>.md          <- raw markdown for Claude Code to rewrite
    notion/pics/<slug>/           <- images + avatar.png for Claude Code to process
"""

import os
import re
import sys
import shutil
import subprocess
from pathlib import Path

import requests
from dotenv import load_dotenv
load_dotenv(dotenv_path=".env")

OUTPUT_DIR  = Path("notion/sync-output")
RAW_DIR     = Path("notion/raw")
PICS_DIR    = Path("notion/pics")
CONFIG_FILE = "notion-sync.config.json"

HTB_TOKEN   = os.environ.get("HTB_TOKEN", "")
HTB_API     = "https://labs.hackthebox.com/api/v4"
HTB_S3      = "https://htb-mp-prod-public-storage.s3.eu-central-1.amazonaws.com"


def slugify(name: str) -> str:
    name = name.lower().strip()
    name = re.sub(r"[^\w\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    return name.strip("-")


def find_output_folder(machine_name: str) -> Path | None:
    if not OUTPUT_DIR.exists():
        return None
    name_lower = machine_name.lower()
    for entry in OUTPUT_DIR.iterdir():
        if entry.is_dir() and entry.name.lower() == name_lower:
            return entry
    for entry in OUTPUT_DIR.iterdir():
        if entry.is_dir() and name_lower in entry.name.lower():
            return entry
    return None


def run_notion_sync(machine_name: str) -> bool:
    cmd = [
        "notion-sync", "pull",
        "--name", machine_name,
        "--config", CONFIG_FILE,
        "--output", str(OUTPUT_DIR),
        "--force",
    ]
    print(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=False)
    return result.returncode == 0


def check_existing(slug: str) -> bool:
    raw_exists  = (RAW_DIR / f"{slug}.md").exists()
    pics_exists = (PICS_DIR / slug).exists() and any((PICS_DIR / slug).iterdir())
    if raw_exists or pics_exists:
        print(f"\nSkipping — already pulled:")
        if raw_exists:
            print(f"  notion/raw/{slug}.md exists")
        if pics_exists:
            count = len(list((PICS_DIR / slug).iterdir()))
            print(f"  notion/pics/{slug}/ exists ({count} files)")
        print(f"\nTo re-pull, delete them first:")
        if raw_exists:
            print(f"  rm notion/raw/{slug}.md")
        if pics_exists:
            print(f"  rm -rf notion/pics/{slug}/")
        return True
    return False


def copy_images(src_images: Path, slug: str) -> int:
    dest = PICS_DIR / slug
    dest.mkdir(parents=True, exist_ok=True)

    if not src_images.exists():
        return 0

    valid_exts = {".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"}
    images = sorted([
        f for f in src_images.iterdir()
        if f.is_file() and f.suffix.lower() in valid_exts
    ])

    for img in images:
        shutil.copy2(img, dest / img.name)
        print(f"  {img.name}")

    return len(images)


def copy_markdown(src_md: Path, slug: str) -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src_md, RAW_DIR / f"{slug}.md")


def fetch_htb_avatar(machine_name: str, slug: str) -> bool:
    """
    Fetch the HTB machine avatar and save it to notion/pics/<slug>/avatar.png.
    Uses:
      1. GET /api/v4/machine/profile/<name>  -> .info.avatar hash
      2. GET S3 bucket URL                   -> actual PNG (no auth needed)
    """
    if not HTB_TOKEN:
        print("  HTB_TOKEN not set in .env, skipping avatar fetch")
        return False

    print("Fetching HTB avatar...")

    # HTB API is case-sensitive — capitalize each word (e.g. "escapetwo" -> "EscapeTwo")
    htb_name = machine_name.title()

    # GET /api/v4/machine/profile/<name> — works for all machines on labs.hackthebox.com
    headers = {
        "Authorization": f"Bearer {HTB_TOKEN}",
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }
    avatar_path = ""
    try:
        r = requests.get(
            f"{HTB_API}/machine/profile/{htb_name}",
            headers=headers,
            timeout=10
        )
        r.raise_for_status()
        avatar_path = r.json().get("info", {}).get("avatar", "")
    except Exception as e:
        print(f"  HTB API error: {e}")
        return False

    if not avatar_path:
        print("  No avatar found in HTB API response")
        return False

    # avatar_path looks like /avatars/<hash>.png
    # strip leading slash and build S3 URL
    avatar_url = f"{HTB_S3}/{avatar_path.lstrip('/')}"

    # Step 2: download from S3 (public, no auth needed)
    try:
        r = requests.get(avatar_url, timeout=10)
        r.raise_for_status()

        dest = PICS_DIR / slug / "avatar.png"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(r.content)
        print(f"  avatar.png saved ({len(r.content) // 1024}KB)")
        return True
    except Exception as e:
        print(f"  Avatar download failed: {e}")
        return False


def main():
    if len(sys.argv) < 2:
        print("Usage: python pull_writeup.py <machine-name>")
        print("Example: python pull_writeup.py cicada")
        sys.exit(1)

    machine_name = " ".join(sys.argv[1:])
    slug = slugify(machine_name)
    print(f"Pulling: {machine_name} -> {slug}")

    if check_existing(slug):
        sys.exit(0)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    if not run_notion_sync(machine_name):
        print("\nnotion-sync failed. Check your config and token.")
        sys.exit(1)

    output_folder = find_output_folder(machine_name)
    if not output_folder:
        print(f"\nCould not find output folder for '{machine_name}' in {OUTPUT_DIR}")
        print(f"Contents of {OUTPUT_DIR}:")
        for f in OUTPUT_DIR.iterdir():
            print(f"  {f.name}")
        sys.exit(1)

    print(f"Found output: {output_folder.name}")

    index_md   = output_folder / "index.md"
    images_dir = output_folder / "images"

    if not index_md.exists():
        print(f"No index.md found in {output_folder}")
        sys.exit(1)

    # Copy writeup images
    print("Copying images...")
    img_count = copy_images(images_dir, slug)
    print(f"Copied {img_count} image(s) -> notion/pics/{slug}/")

    # Copy markdown
    copy_markdown(index_md, slug)
    print(f"Copied markdown -> notion/raw/{slug}.md")

    # Fetch HTB avatar
    fetch_htb_avatar(machine_name, slug)

    # Clean up temp output
    shutil.rmtree(output_folder)
    print("Cleaned up temp output")

    print(f"\nDone.")
    print(f"  notion/raw/{slug}.md")
    print(f"  notion/pics/{slug}/  ({img_count} images + avatar.png)")
    print(f"\nNow open Claude Code and run:")
    print(f"  > rewrite the {machine_name} writeup using CLAUDE.md")


if __name__ == "__main__":
    main()

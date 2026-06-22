#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
compile.py — 从 chinese-poetry 的纳兰性德诗集生成 poems.json

输入：纳兰性德诗集.json（来自 chinese-poetry 仓库）
输出：poems.json（与花间集应用兼容的结构）

数据结构：
{
  "meta": { "title": "纳兰词", "period": "清", "total": N, "authors": [...] },
  "poems": [
    { "id": 1, "title": "...", "rhythmic": "...", "author": "纳兰性德", "content": [...] },
    ...
  ]
}
"""
import json, re
from pathlib import Path

SRC = Path(__file__).parent / "纳兰性德诗集.json"
DST = Path(__file__).parent / "poems.json"

def split_title(title):
    """从「长相思·山一程」中拆出 词牌 与 题目。
    若无「·」分隔，则整个 title 视为词牌，题目为空。"""
    if "·" in title:
        rhythmic, _, name = title.partition("·")
        return rhythmic.strip(), name.strip()
    return title.strip(), ""

def main():
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    poems = []
    authors = set()
    for i, item in enumerate(raw, 1):
        rhythmic, name = split_title(item["title"])
        title = item["title"].strip()
        content = [line.strip() for line in (item.get("para") or []) if line.strip()]
        author = item.get("author", "纳兰性德").strip()
        authors.add(author)
        poems.append({
            "id": i,
            "title": title,
            "rhythmic": rhythmic,
            "name": name,            # 词牌之外的具体题目（如「山一程」）
            "author": author,
            "content": content,
            "period": "清",
        })

    output = {
        "meta": {
            "title": "纳兰词",
            "period": "清",
            "total": len(poems),
            "authors": sorted(authors),
        },
        "poems": poems,
    }
    DST.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"✓ 已生成 {DST.name}：{len(poems)} 首，作者 {len(authors)} 位")
    # 词牌统计
    from collections import Counter
    c = Counter(p["rhythmic"] for p in poems)
    print(f"  词牌种类: {len(c)}")
    print(f"  前10词牌: {[a for a,_ in c.most_common(10)]}")

if __name__ == "__main__":
    main()

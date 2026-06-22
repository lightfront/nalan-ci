# 纳兰词

清代纳兰性德词作——交互式浏览应用。

## 概述

纳兰性德（1655—1685），字容若，号楞伽山人，满洲正黄旗人，清朝著名词人。其词以真挚深情、哀婉凄清著称，王国维《人间词话》誉其「北宋以来，一人而已」。

本应用收录纳兰性德词作 **258 首**，可浏览、搜索、按词牌筛选。

## 功能

- **浏览**：以卡片形式浏览全部词作
- **搜索**：按词牌、题目或词句内容全文搜索
- **筛选**：按词牌筛选
- **详情**：点击卡片在弹窗中查看完整词作
- **响应式**：在桌面和移动设备上均可舒适浏览

## 技术栈

- 纯 HTML / CSS / JavaScript，无框架依赖
- Google Fonts `Noto Serif SC` 中文衬线字体
- 数据来自 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry) 开源数据库

## 本地运行

```bash
python3 -m http.server 8000
# 访问 http://localhost:8000
```

## 数据编译

```bash
python3 compile.py
```

## 许可

诗词数据来自 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（MIT 许可证）。前端代码同样以 MIT 许可证发布。

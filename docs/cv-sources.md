# 商用车信源

`industry/sources.json` 里只放了 2026-09-30 从公网实际请求、能返回新闻列表或 RSS 的地址。站内默认只展示摘要和原文链接（`site_fulltext` 关闭）。

分级沿用框架：`T1` 是部委、协会和当事企业自己的页面，`T2` 是行业媒体和海外媒体。

## 已入库

| 名称 | 类型 | 分级 | 地址 | 状态 |
|---|---|---|---|---|
| 中汽协 · 产销数据 | web_list | T1 | 首页 `.DataStatisticsList`，只收产销栏目链接 | 200。标题含“乘用车”的条目在入库前丢掉 |
| 交通运输部 · 交通要闻 | web_list | T1 | `https://www.mot.gov.cn/xinwen/jiaotongyaowen/index.html` | 200，列表带日期 |
| 潍柴 · 新闻与事件 | web_list | T1 | 潍柴官网媒体中心新闻列表 | 200。含集团活动稿，靠评分压噪声 |
| 宁德时代 · 新闻 | web_list | T1 | `https://www.catl.com/news/` | 200。乘用车向的稿件靠预筛和评分压住 |
| 卡车之家 · 行业新闻 | web_list | T2 | `https://www.360che.com/news/` | 200，页面为 GB2312，抓取端按页面声明解码 |
| 中国卡车网 · 资讯 | web_list | T2 | `https://www.chinatruck.org/news/` | 200。偶发超时，列表结构可用 |
| 方得网 · 卡车 / 客车 / 零部件 / 数据 / 政策 | web_list | T2 | `https://www.find800.cn/list?cid=33\|35\|213\|248\|205` | 五个栏目都返回过带日期的卡片。卡车栏目有时响应慢 |
| Transport Topics | rss | T2 | `https://www.ttnews.com/rss.xml` | 200，站点写明 RSS 可被引用。混有海运等非卡车稿，靠预筛 |
| TruckingInfo | rss | T2 | `https://www.truckinginfo.com/rss` | 200 |
| Sustainable Bus | rss | T2 | `https://www.sustainable-bus.com/feed/` | 200，客车与新能源公交 |
| Electrek · Electric Trucks | rss | T2 | `https://electrek.co/guides/electric-trucks/feed/` | 200。含皮卡和港口电动车，纯乘用车靠预筛 |
| Fleet Equipment | rss | T2 | `https://www.fleetequipmentmag.com/feed/` | 200，车队装备与补能 |

中国大陆服务器抓海外 RSS 失败时，按 [部署](deploy.md) 设置 `EGRESS_PROXY_URL`。调用模型的地址不走这个代理。

## 核对过但没有入库

这些地址在当天的请求里不能稳定抓出文章列表。不要把打不开的 URL 写进 `sources.json`。站主以后可以在后台补，或用 `POST /api/ingest/items` 自己推进来。

| 候选 | 当天情况 | 建议 |
|---|---|---|
| 第一商用车网 `cvworld.cn` | 多次空响应或 502，列表页打不开 | 官网不稳定。公众号是主要渠道，配好极致了（Dajiala）后再加 `mp_account`，不要猜 `ghid` |
| 工信部新闻页 | `miit.gov.cn` 列表页只有约 2KB 的前端壳，选择器拿不到条目 | 等有静态列表或自己用外部推送接公告、推荐目录 |
| 中国重汽 `cnhtc.com.cn`、`sinotruk.com` | HTTP 418 | 官网暂不抓。动态看卡车之家、方得网、中国卡车网 |
| 一汽解放 | `fawjiefang.com.cn` 超时或 410；`faw.com.cn` 没有稳定的商用车新闻列表 | 同上，先靠媒体 |
| 东风商用车 `dfcv.com.cn` | 首页是前端应用，静态 HTML 里没有新闻列表 | 找到可解析列表后再加 |
| 宇通 `yutong.com.cn` | 返回反爬挑战页 | 不入库 |
| 陕汽新闻列表 | `sxqc.com` 栏目页没有稿件链接 | 不入库 |
| Autostat | `https://www.autostat.ru/news/rss/` 曾返回 RSS，随后 403 | 不稳定，不入库。俄罗斯卡车新闻可改由站主自己的脚本推送 |
| Truck News、trans.info、Commercial Motor | feed 为 403 或 404 | 不入库 |
| 盖世汽车 `ClassRss.aspx` | RSS 可达，抽查标题以乘用车为主 | 整源灌入会把预筛和评分预算花在噪声上。若只要皮卡或供应链，在后台单建一条并加标题过滤 |

## 公众号

商用车的很多一手解读在微信公众号（第一商用车网、方得网、卡车之家、整车厂官微）。框架支持 `mp_account`，但每次拉列表都走极致了，按次计费，并受预算熔断。没有 key、也没有核对过的 `ghid` 时，不预置这些源。配置见 [信源](sources.md)。

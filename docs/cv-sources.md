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
| 方得网 · 卡车 / 客车 / 零部件 / 数据 / 政策 | web_list | T2 | `https://www.find800.cn/list?cid=33\|35\|213\|248\|205` | 五个栏目都解析出过带日期的稿件。站点偶发超时；空页上的“页面未找到”在入库前丢掉 |
| Transport Topics | rss | T2 | `https://www.ttnews.com/rss.xml` | 200，站点写明 RSS 可被引用。混有海运等非卡车稿，靠预筛 |
| TruckingInfo | rss | T2 | `https://www.truckinginfo.com/rss` | 200 |
| Sustainable Bus | rss | T2 | `https://www.sustainable-bus.com/feed/` | 200，客车与新能源公交 |
| Electrek · Electric Trucks | rss | T2 | `https://electrek.co/guides/electric-trucks/feed/` | 200。含皮卡和港口电动车，纯乘用车靠预筛 |
| Fleet Equipment | rss | T2 | `https://www.fleetequipmentmag.com/feed/` | 200，车队装备与补能 |
| 美国卡车运输协会 ATA | rss | T1 | `https://www.trucking.org/rss.xml` | 200。含运量指数，也有国会简报，靠评分压噪声 |
| 国际道路运输联盟 IRU | rss | T1 | `https://www.iru.org/rss.xml` | 200 |
| 美国联邦公报 · FMCSA | rss | T1 | Federal Register 按机构 FMCSA 的 RSS | 200。标题含 Exemption、Hearing、Information Collection 的条目在入库前丢掉。`fmcsa.dot.gov` 本身 403，所以用公报 |
| 帕卡 · 新闻 | rss | T1 | `https://www.paccar.com/rss` | 200，历史很长，首次只回填 8 条 |
| 曼恩 · 新闻 | rss | T1 | `https://press.mantruckandbus.com/corporate/feed/en` | 200。`/corporate/rss` 是 404 |
| 传拓 · 新闻 | rss | T1 | `https://traton.com/rss/?generatorName=elastic&locale=en` | 200。不带查询参数的地址返回的是新闻室网页，不是订阅源 |
| 国际卡车 International · 新闻 | rss | T1 | `https://news.international.com/news?pagetemplate=rss` | 200。`news.navistar.com/feed` 返回的是网页 |
| 戴姆勒卡车 · 新闻室 | web_list | T1 | `https://www.daimlertruck.com/en/newsroom`，选择器 `a.card` | 200，能取出新闻稿链接。日期是 `DD.MM.YYYY`，当前解析器读不出，标题里仍带着日期 |
| 沃尔沃集团 · 新闻 | web_list | T1 | `https://www.volvogroup.com/en/news-and-media.html` | 200，列表带日期。含非卡车奖项，靠评分压住 |
| 斯堪尼亚 · 新闻室 | web_list | T1 | `https://www.scania.com/group/en/home/newsroom.html` | 200。日期写在链接文字里，解析器不单独拆出 |
| FreightWaves | rss | T2 | `https://www.freightwaves.com/feed` | 200。物流面很宽，非卡车稿靠预筛 |
| Truck & Bus News | rss | T2 | `https://www.truckandbusnews.net/feed/` | 200，东南亚商用车 |
| Commercial Vehicle India | rss | T2 | `https://www.commercialvehicle.in/feed/` | 200。偶有工程机械稿 |
| Freight News | rss | T2 | `https://www.freightnews.co.za/rss` | 200。`/feed` 是 404。非洲物流，非车队稿靠预筛 |
| Transporte Informativo | rss | T2 | `https://www.transporteinformativo.com.mx/feed/` | 200，墨西哥重型车 |
| 吉尔泰卡 · 新闻 | rss | T1 | `https://www.girteka.eu/feed/` | 200，10 条。欧洲干线车队 |
| 老道明 · 投资者关系 | rss | T1 | `https://ir.odfl.com/rss` | 200。标题含 to Webcast、Conference Call 的条目在入库前丢掉 |
| 奥莱利 · 公司新闻 | rss | T1 | `https://corporate.oreillyauto.com/feed/` | 200。团建、返校和自驾类标题在入库前丢掉。财报标题保留，纯每股收益靠预筛 |
| 莱德 · 洞察 | rss | T1 | `https://www.ryder.com/en-us/api/rssfeed/showrssfeed` | 200，约 589 条，按发布时间排序后首次回填 8 条。投资者站被 Cloudflare 拦住，这条是洞察博客，通用供应链软文靠评分压住 |
| HDA Truck Pride | rss | T1 | `https://www.hdatruckpride.com/feed` | 200。重载配件网络，也有活动稿 |
| Fleet Owner | rss | T2 | 首页定时内容 RSS（`/rss` 是 404） | 200，25 条 |
| Trucking Dive | rss | T2 | `https://www.truckingdive.com/feeds/news/` | 200 |
| aftermarketNews | rss | T2 | `https://www.aftermarketnews.com/feed/` | 200。乘用车配件目录靠预筛 |
| Aftermarket Matters | rss | T2 | `https://www.aftermarketmatters.com/feed/` | 200。含商用车供应商活动，也有乘用车配件 |
| Google 新闻 · 轮胎即服务与翻新 | rss | T2 | 关键词 `tires as a service` 或 `retread` fleet | 200，48 条。链接是 Google 新闻中转，和原文不是同一条 URL，去重靠后面的事件归并 |
| Google 新闻 · 米其林车队 | rss | T2 | 关键词 Michelin fleet | 200。米其林新闻室静态页没有稿件链接，用这条补 |
| Google 新闻 · 汽配连锁与重载配件 | rss | T2 | 关键词 AutoZone Commercial、NAPA AutoCare、FleetPride | 200。夹杂股价解读，靠评分压住 |
| Google 新闻 · 换电重卡 | rss | T2 | 关键词「换电重卡」 | 200。东风、宁德时代、远程等换电落地 |
| Google 新闻 · 开思汽配 | rss | T2 | 关键词「开思」汽配 | 200，12 条。开思官网没有可解析列表 |
| 亨特运输 · 新闻室 | web_list | T1 | `https://www.jbhunt.com/our-company/newsroom` | 200，9 条。标题取 `h4`，不要用 “Read More” |
| G7易流 · 新闻 | web_list | T1 | `https://www.g7.com.cn/News-center.html` | 200，13 条。页面不是按新到旧排，入库前按日期排序 |
| 中交兴路 · 官方动态 | web_list | T1 | `https://www.sinoiov.com/news/official/` | 200，15 条。含助学稿，靠评分压住 |
| 智加 · 新闻 | web_list | T1 | `https://www.plus.ai/news-and-insights` | 200，93 条，首次回填 8 条 |
| 顺丰控股 · 巨潮公告 | json_list | T1 | 巨潮 `hisAnnouncement/query`，股票 `002352,9900010448`，表单提交 | 200，30 条，标题是顺丰公告。必须用 `application/x-www-form-urlencoded`，JSON 体会返回全市场 |
| 圆通速递 · 巨潮公告 | json_list | T1 | 股票 `600233,gssh0600233`，上交所 | 200，标题含圆通 |
| 韵达股份 · 巨潮公告 | json_list | T1 | 股票 `002120,9900002261` | 200，含月度经营指标 |
| 申通快递 · 巨潮公告 | json_list | T1 | 股票 `002468,9900014251` | 200，含经营简报 |
| 中国外运 · 巨潮公告 | json_list | T1 | 股票 `601598,gshk0000598`，上交所 | 200 |
| 长久物流 · 巨潮公告 | json_list | T1 | 股票 `603569,9900026446`，上交所 | 200 |
| 工业和信息化部 · 通知公告 | web_list | T1 | 栏目页是前端壳。列表在 `jpaas-publish-server` 返回的 `data.html`，选择器 `li.cf` | 200。标题不含商用车、汽车、新能源、电池、物流等词的通知在入库前丢掉 |
| 国家发展改革委 · 通知 | web_list | T1 | `https://www.ndrc.gov.cn/xxgk/zcfb/tz/index.html`，链接 `a[href*='/t20']` | 200，25 条，标题带文号。同样按商用车相关词过滤 |
| 财政部 · 政策发布 | web_list | T1 | `https://www.mof.gov.cn/zhengwuxinxi/zhengcefabu/index.htm` | 200，19 条。当天留下节能与新能源汽车车船税通知，其余标题被商用车词表滤掉 |
| 中国内燃机工业协会 · 销量综述 | web_list | T1 | `https://www.ciceia.org.cn/` 首页里 `/xinwendongtai/` 链接 | 200。只留标题含销量、产量、产销或进出口的条目，例如 2026 年 8 月销量综述 |
| 中国汽车流通协会 | web_list | T1 | `http://www.cada.cn/` | 200。丢掉乘用车标题，留下二手车、经销商库存等 |
| 潍柴动力 · 巨潮公告 | json_list | T1 | 股票 `000338,9900002961`，深交所 | 200，公告可按公司过滤。产销数字在 PDF 里，列表标题通常没有可抽取的台数 |
| 交通运输部 · 行政规范性文件 | web_list | T1 | `https://xxgk.mot.gov.cn/xzgfxwj/` | 200，解析 15 条，当天留下 8 条（含公路水运工程质量事故等级划分）。政策解读页和 `zs.mot.gov.cn` 没有可用列表，不入库 |
| 生态环境部 · 标准发布 | web_list | T1 | `https://www.mee.gov.cn/ywgz/fgbz/bz/bzfb/` | 200，解析 15 条，当天留下 3 条（含汽车大气污染物、交通量法）。公告索引与标准发布重叠，不另建一条 |
| 生态环境部 · 行政规范性文件 | web_list | T1 | `https://www.mee.gov.cn/xxgk2018/xxgk/xzgfxwj/` | 200，解析 20 条，当天留下 2 条（含优化机动车环境监管） |
| 市场监管总局召回中心 · 汽车召回 | web_list | T1 | `https://www.samrdprc.org.cn/qczh/qczhgg1/` | 200，解析 17 条。总局 `samr.gov.cn` 公告目录是 404。当天第一页是乘用车召回，商用车词表留下 0 条；列表仍入库，以后出现货车、客车、牵引、挂车召回才会进来 |
| 商务部 · 政策发布 | web_list | T1 | `https://www.mofcom.gov.cn/zcfb/index.html` | 200，解析 8 条，当天留下 2 条（含 2027 年度汽车和摩托车出口许可）。这是部令和规范性文件，不是政策解读 |
| 中国道路运输协会 · 通知公告 | web_list | T1 | `https://www.crta.org.cn/news.html?id=28` | 200，通知公告栏目解析 5 条、留下 5 条。首页混有会议新闻，所以用这个栏目页 |
| 山东省工业和信息化厅 · 通知 | web_list | T1 | 栏目页是前端壳。列表是 POST `dataproxy.jsp`（webid 78，columnid 15201）返回的 CDATA | 200，当页解析 46 条。当天标题没有商用车词，留下 0 条。列表仍入库，以后对上词才会进来 |
| 广东省工业和信息化厅 · 通知公告 | web_list | T1 | `https://gdii.gd.gov.cn/zwgk/tzgg1011/index.html`，链接 `/content/post_` | 200，解析 20 条，当天留下 0 条。同一套商用车词表，列表仍入库 |
| 吉林省工业和信息化厅 · 通知公告 | web_list | T1 | `http://gxt.jl.gov.cn/xxgk/tzgg/` | 200，解析 6 条，当天留下 0 条。列表仍入库 |
| 湖北省经济和信息化厅 · 公文发布 | web_list | T1 | `http://jxt.hubei.gov.cn/fbjd/zc/qtzdgkwj/gwfb/` | 200，解析 20 条，当天留下 0 条。列表仍入库 |
| 北京市经济和信息化局 · 通知公告 | web_list | T1 | `https://jxj.beijing.gov.cn/jxdt/tzgg/` | 200，解析 20 条，当天留下 0 条。链接里的日期可解析。列表仍入库 |
| 中国政府网政策库 · 标题含货车 | json_list | T1 | `sousuo.www.gov.cn` 的 `zhengcelibrary`，结果在 `searchVO.catMap.bumenfile.listVO` | 200，解析 20 条，当天留下 12 条。第一条是 2026 年老旧营运货车报废更新。这是标题检索，不是政策库全量；顶层 `totalCount` 为 0 时条目仍在 `catMap` |
| 福田汽车 · 产销快报 | json_list | T1 | 巨潮股票 `600166,gssh0600166`，检索词「产销」 | 200，解析 20 条、留下 20 条，含 2026 年 8 月 PDF 快报。表内「本月」销量和产量会抽进数据页；累计、同比和乘用车不进。附注里的福戴重卡和福康发动机按品牌另记一行，不并进合计 |
| Google 新闻 · 公安部交管（转载） | rss | T2 | `site:mps.gov.cn` 加货车、机动车、挂车、治超 | 200，解析 100 条，当天留下 19 条（含全国机动车保有量）。公安部官网是 521，122.gov.cn 是 405，`site:122.gov.cn` 是 0 条，所以这是标明转载的兜底。链接是 Google 新闻中转 |

巨潮公告里，标题含独立董事、监事会、法律意见书、股票交易异常波动、提示性公告、无偿捐赠、一致行动人的条目在入库前丢掉。纯财务手续仍可能漏网，由预筛拦住。PDF 只作原文链接，站内不展开全文。

中国大陆服务器抓海外 RSS 失败时，按 [部署](deploy.md) 设置 `EGRESS_PROXY_URL`。调用模型的地址不走这个代理。

## 核对过但没有入库

这些地址在当天的请求里不能稳定抓出文章列表。不要把打不开的 URL 写进 `sources.json`。站主以后可以在后台补，或用 `POST /api/ingest/items` 自己推进来。

| 候选 | 当天情况 | 建议 |
|---|---|---|
| 第一商用车网 `cvworld.cn` | 多次空响应或 502，列表页打不开 | 官网不稳定。公众号是主要渠道，配好极致了（Dajiala）后再加 `mp_account`，不要猜 `ghid` |
| 工信部新闻页本身 | 栏目 HTML 仍是前端壳 | 通知公告改走上面的 `data.html` 接口。新闻页本身仍不入库 |
| 公安部 `mps.gov.cn`、`122.gov.cn` | 521 挑战页，122 返回 405 | 官网不入库。交管动态用上面标明转载的 Google 新闻 |
| 国务院政策库整库页面 | `gov.cn/zhengce/zuixin/` 没有可解析的文件链接 | 不把空页面入库。标题含「货车」的部门文件改走上面的检索接口 |
| 河北、河南、浙江、陕西、内蒙古、天津、重庆、深圳工信或交通站，以及上海经信委政策目录 | 超时、403、抓取失败，或页面里没有稿件链接 | 不入库。没有为这些省厅编造栏目地址 |
| 江苏工信厅栏目页 | 首页有工作会议链接，`col/col6278` 抽不到条目 | 不把会议列表当成政策文件 |
| 玉柴国际 6-K、玉柴产品站、云内动力、全柴动力、潍柴重机 | 6-K 标题只有 “6-K”。玉柴产品站没有新闻列表。三家 A 股用「产销」检索公告为空。玉柴集团巨潮仍只有资产支持证券 | 不入库。没有月度产量表就不要从财报里猜台数 |
| 上牌量、交强险的独立统计表 | 方得网月报正文写的是销量和北斗入网，交强险只被拿来对照，旁边没有台数。排名图是图片，没有 OCR | 正文或表格里写明的上牌量、交强险、产量、销量、批发会入库。图片里的数和 PDF 抽不出的字，用后台「数据录入」或 CSV，不自动生成 |
| 中国重汽 `cnhtc.com.cn`、`sinotruk.com` | HTTP 418 | 官网暂不抓。动态看卡车之家、方得网、中国卡车网 |
| 一汽解放 | `fawjiefang.com.cn` 超时或 410；`faw.com.cn` 没有稳定的商用车新闻列表 | 同上，先靠媒体 |
| 东风商用车 `dfcv.com.cn` | 首页是前端应用，静态 HTML 里没有新闻列表 | 找到可解析列表后再加 |
| 宇通 `yutong.com.cn` | 返回反爬挑战页 | 不入库 |
| 陕汽新闻列表 | `sxqc.com` 栏目页没有稿件链接 | 不入库 |
| Autostat | `https://www.autostat.ru/news/rss/` 曾返回 RSS，随后 403 | 不稳定，不入库。俄罗斯卡车新闻可改由站主自己的脚本推送 |
| Truck News、trans.info、Commercial Motor | feed 为 403 或 404 | 不入库 |
| 美国交通部、FMCSA、NHTSA 官网及 RSS | `transportation.gov`、`fmcsa.dot.gov`、`nhtsa.gov` 返回 403 | 法规动态改用上面的联邦公报 FMCSA 源。NHTSA 公报以乘用车规则为主，召回接口要指定车型年款，不是新闻列表 |
| EPA 新闻 RSS 与重型车温室气体页 | 新闻 RSS 返回 HTTP 202 空正文；按 “heavy-duty” 搜公报多为电厂和臭氧规则；卡车温室气体页是单篇静态文 | 不入库 |
| ACEA | `acea.auto` 的 feed、新闻和商用车注册页均为 HTTP 202、正文约 180 字节 | 不入库 |
| CCJ、Overdrive、Tire Business、Modern Tire Dealer | 403、404 或 Cloudflare | 不入库。Fleet Owner 的 `/rss` 是 404，改用上面的定时内容 RSS |
| 普利司通官网与美洲新闻室 | 公司新闻以摩托和乘用车为主；美洲新闻室 HTML 里没有稿件链接（前端渲染），RSS 403 | 不入库 |
| 米其林新闻室 | 页面能打开，静态 HTML 里没有稿件链接；`/feed` 是生活方式内容 | 不入库 |
| 固特异新闻 RSS | `news.goodyear.com` 的 RSS 能打开，抽查是零售店、飞艇和财报，不是车队项目 | 不入库，避免把预算花在消费端 |
| 俄罗斯商业媒体与 Autostat | Kommersant RSS 是综合新闻；`logirus.ru` 不像订阅源；`ati.su/rss` 404；Autostat 仍会 403 | 不入库。俄罗斯和中亚的出口稿并入海外市场，由国内媒体和站主推送补 |
| 盖世汽车 `ClassRss.aspx` | RSS 可达，抽查标题以乘用车为主 | 整源灌入会把预筛和评分预算花在噪声上。若只要皮卡或供应链，在后台单建一条并加标题过滤 |
| 米其林、普利司通、固特异新闻室的车队稿 | 米其林静态页无稿件链接，`/en/rss` 404；普利司通近期是摩托胎；固特异 `corporate.goodyear.com/.../media.rss` 404 | 车队轮胎用上面的 Google 新闻关键词，不把生活方式稿整源入库 |
| AutoZone、前进汽配、NAPA/真配件、LKQ、FleetPride、TruckPro、Schneider、Werner、Knight-Swift、Penske、XPO、UPS、FedEx 新闻室或 IR | 403、Cloudflare、404 或域名解析失败。FleetPride、TruckPro、Parts Authority、Motion 的 feed 同样打不开 | 汽配渠道用奥莱利官网、HDA Truck Pride 和 Google 新闻关键词。车队用能打开的吉尔泰卡、老道明、莱德洞察、亨特运输 |
| NACFE `nacfe.org` | HTTP 202 空正文或 403 | 不入库 |
| PR Newswire、GlobeNewswire 的汽车主题 RSS | 能解析，抽查是医药、律所或与商用车无关 | 不入库 |
| SEC EDGAR 的 10-K、8-K Atom | 能解析，标题全是 “10-K - Annual report” 或 “8-K - Current report”，链接是申报索引 | 没有战略正文，不入库 |
| 京东物流 IR、港交所公告页 | 页面是前端壳，列表是模板变量 | 不入库。京东物流仍在主题页里，等有静态列表或公众号 |
| 顺丰官网、中通官网 | 顺丰新闻 RSS 返回的是网页；中通页面抽查没有新闻链接 | 顺丰改用巨潮公告。中通快递、极兔没有可用的公告列表 |
| 德邦股份巨潮 | 检索结果标记为已退市 | 不建公告源。主题页保留，方便媒体稿归类 |
| 满帮投资者 RSS | `ir.fulltruckalliance.com` 的 rss 地址返回的是网页 | 不入库 |
| 圆通官网 `yto.net.cn` | 抓取失败 | 已用巨潮公告 |
| 中国物流与采购联合会 | `chinawuliu.com.cn`、`cflp.org.cn` 502 或抓取失败 | 不入库 |
| 货拉拉、安能、壹米滴答、福佑、图森、小马智卡、途虎、开思官网、启源芯动力、国家能源、中煤、渣土或水泥车队 | 没有核对到可解析的新闻列表或公告接口 | 不入库。换电和开思用 Google 新闻关键词。这些公司仍在主题页，文章出现后可以按公司浏览 |

## 产销、上牌和交强险怎么进数据页

入库时只从已经保存的正文、HTML 表格和巨潮 PDF（`pdftotext -layout`）抄数字。自动抽取的一行要同时有期间、细分、指标、数值和单位，粒度记为单月。累计、前几个月合计、同比和环比百分比不进自动抽取。排名图没有 OCR，抽不出的数不编。

已经逐字核对过的历史数字在 `industry/metric-seed.ts`，用 `node scripts/backfill-metrics.ts` 写入。脚本会先删掉上次写入的种子行再插入，可重复运行，不动文章抽取和【样例】。种子行的粒度是 `year`（全年）、`month`（单月）或 `ytd`（原文写出的 1–N 月累计，期间记到结束月）。同一期间的单月和累计靠粒度区分。

数据统计页的年度图只用 `year`。2026 年累计优先用原文的 `ytd`；只有 1 月起的单月已经连续排到比这份累计更晚时，才改用各月相加。和上一年比时，对齐到同一个截止月，不拿全年去比 1–8 月。增长百分比不反推成水平值。品牌用 `industry/metric-alias.ts` 的精确别名合成，`brand_text` 留原文用字。万辆、万台在页面上按公布值乘以 10000 折成辆、台，原数字和原单位仍保存。折合后的整数不是原文印出来的。某一指标一旦有原文数字，该指标的【样例】行不再公开。

上市公司年报里的产销表在 `industry/metric-filings.ts`，回补脚本会和其余种子一起写入。中汽协英文站 2020–2023 年 12 月表的单位是 `Unit: 10000`，入库时记成万辆，摘录保留原文。2023 年 8 月那一页标题是 August、累计列却写 Jan.—Sep.，没有入库。000800 在资产重组前的年报是一汽轿车，不算解放的卡车产销。000951 是济南卡车股份，和媒体榜上的中国重汽集团全口径不是同一张表。潍柴年报里的商用车是合并报表整车（含陕汽），表上没有把「陕汽」和这组万辆写在一起。

每月 12 日 9:00（北京时间）worker 跑 `metrics.bulletin`：读中汽协英文月表、巨潮产销公告和内燃机协会首页新稿。英文站证书过期时只对该主机跳过校验。`COLLECT_ENABLED=false` 时不访问网络。表格能逐项对上的行直接公开；只有「产销」和数字、对不上栏目的行记为待核对，后台点公开后才给读者看。新的单月和原文累计会让数据页的累计接到更晚的月份。

规则抽不到、但正文里写了上牌量或交强险时，模型可以补一行。这一行必须能在原文里找到同样的数字和单位，而且先标成待核对，后台点「公开」之后读者才看得到。仍然抽不到的，在后台「数据录入」手工添加或导入 CSV。表头可以是 `metric,segment,brand,period,value,unit,source_name,url`（按单月），或在期间后加上 `grain`（`month`、`year`、`ytd`）。年度期间写成 `YYYY`，累计期间写成结束月 `YYYY-MM`。

2026-10-01 核对进种子的原文：中国商用汽车网 2025 年产销（`http://cv.ce.cn/news/202601/t20260114_2701187.shtml`）和 2026 年 8 月重卡企业销量（`http://cv.ce.cn/news/202609/t20260921_3228065.shtml`）；新浪财经转中汽协 2024 年产销（`https://finance.sina.com.cn/roll/2025-01-13/doc-ineevkut2611207.shtml`）；EV 视界转 2026 年 8 月及 1–8 月（`https://www.evlook.com/news-58860.html`）；卡车信息网 2025 年重中轻卡企业累计（`http://www.360trucks.cn/news/2026/0115/108780.shtml`）；卡车网 2024 年重卡开票与上牌（`https://www.chinatruck.org/news/202501/68_124100.html`）；中国内燃机工业协会 2025 年 12 月、2026 年 7 月、2026 年 8 月销量综述；我的钢铁网转载的 2025 年多缸柴油机企业万台（`https://news.mysteel.com/a/26011615/B51C222EFE8F05B3.html`）。协会页上的品牌份额没有换算成台数。卡车信息网另一篇把玉柴商用车柴油机写成 22.61 万台，与协会份额和钢铁网正文的 23.94 万台不一致，种子采用写出 23.94 万台的那一篇。国家统计局接口返回 403，2011–2023 年行业年度没有编入。交强险台数没有出现在这些正文里。

2026 年 8 月核对过的原文：福田汽车产销快报 PDF（`http://static.cninfo.com.cn/finalpage/2026-09-05/1225548834.PDF`）抽出中重型货车本月销量 12817 辆、产量 11824 辆，附注福戴重卡 7121 辆、福康发动机 10031 台。方得网 `https://www.find800.cn/news/168789/248` 写出国内重卡销量 4.6 万辆。同站 `https://www.find800.cn/news/168904/248` 写出轻卡单月 15.7 万辆、商用车销量 32.8 万辆。这两篇没有写出上牌量或交强险台数。卡车之家当次没有打开，第一商用车网列表不稳定，电卡网没有核对到列表。

## 公众号

商用车的很多一手解读在微信公众号（第一商用车网、方得网、卡车之家、整车厂官微）。国内车队和新业态还适合补这些号：顺丰、京东物流、中通快递、圆通、申通、韵达、极兔、德邦、安能、壹米滴答、福佑、满帮、货拉拉、运联智库、物流指闻、物流汇、G7易流、中交兴路、开思、途虎养车。

框架支持 `mp_account`，但每次拉列表都走极致了，按次计费，并受预算熔断。本仓库没有核对过的 `ghid`，也没有把猜的 id 写进 `sources.json`。配好极致了密钥后，在后台建源，填核对过的 `ghid`。配置见 [信源](sources.md)。

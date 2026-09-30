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

巨潮公告里，标题含独立董事、监事会、法律意见书、股票交易异常波动、提示性公告、无偿捐赠、一致行动人的条目在入库前丢掉。纯财务手续仍可能漏网，由预筛拦住。PDF 只作原文链接，站内不展开全文。

中国大陆服务器抓海外 RSS 失败时，按 [部署](deploy.md) 设置 `EGRESS_PROXY_URL`。调用模型的地址不走这个代理。

## 核对过但没有入库

这些地址在当天的请求里不能稳定抓出文章列表。不要把打不开的 URL 写进 `sources.json`。站主以后可以在后台补，或用 `POST /api/ingest/items` 自己推进来。

| 候选 | 当天情况 | 建议 |
|---|---|---|
| 第一商用车网 `cvworld.cn` | 多次空响应或 502，列表页打不开 | 官网不稳定。公众号是主要渠道，配好极致了（Dajiala）后再加 `mp_account`，不要猜 `ghid` |
| 工信部新闻页本身 | 栏目 HTML 仍是前端壳 | 通知公告改走上面的 `data.html` 接口。新闻页本身仍不入库 |
| 交通运输部政策库、生态环境部信息公开、市场监管总局政策页、公安部交管、国务院政策库 | 空正文、404、521 挑战页或跳到打不开的地址 | 不入库。交通运输部仍用已经能打开的交通要闻 |
| 山东省工信厅、中国道路运输协会 | 抓取失败 | 不入库。省市工信、交通、商务厅站多数同样打不开，没有把未核对的省厅写进去 |
| 商务部政策解读页 | 能打开，抽到的是解读稿而不是文件列表，且当天与商用车无关 | 不入库 |
| 玉柴、云内动力巨潮 | 云内动力检索为空。玉柴只返回资产支持证券，不是发动机产销公告 | 不入库。玉柴仍在主题页 |
| 上牌量、交强险的公开表 | 第一商用车网列表打不开。方得网和卡车之家能抓到新闻标题，标题里通常没有可直接入库的台数 | 不把猜的数字写进数据表。公众号月报要等极致了。正文里若写明“某年某月某细分销量 N 万辆”，发布时会抽进数据页 |
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

## 公众号

商用车的很多一手解读在微信公众号（第一商用车网、方得网、卡车之家、整车厂官微）。国内车队和新业态还适合补这些号：顺丰、京东物流、中通快递、圆通、申通、韵达、极兔、德邦、安能、壹米滴答、福佑、满帮、货拉拉、运联智库、物流指闻、物流汇、G7易流、中交兴路、开思、途虎养车。

框架支持 `mp_account`，但每次拉列表都走极致了，按次计费，并受预算熔断。本仓库没有核对过的 `ghid`，也没有把猜的 id 写进 `sources.json`。配好极致了密钥后，在后台建源，填核对过的 `ghid`。配置见 [信源](sources.md)。

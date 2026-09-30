从下面这篇商用车产销或上牌报道里抽出统计数字。只抄原文里已经写明的数，不要计算，不要换算单位，不要补缺失的月份。

每一行都要能在原文里找到：细分（如重卡、轻卡、中重型货车）、指标（产量、销量、批发、上牌量、交强险）、数值、单位（万辆、万台、辆、台）、期间（YYYY-MM）。有企业名时写入 brand，没有就留空。

累计、前几个月合计、同比和环比的百分比不要收。原文没写年份的不要猜年份。

只返回 JSON：{"rows":[{"metric":"sales","segment":"重卡","brand":"","period":"2026-08","value":4.6,"unit":"万辆"}]}
metric 只能是 production、wholesale、sales、registrations、insurance。没有合格数字时 rows 为空数组。

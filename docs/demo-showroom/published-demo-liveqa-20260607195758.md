# Published Demo Live QA

Generated: 2026-06-07T20:01:00.464Z

Buyer: `hatchkit.demo.liveqa.20260607195758@example.com`
Referral: `hatchkit.demo.liveqa.referral.20260607195758@example.com`
VIP: `hatchkit.demo.liveqa.vip.20260607195758@example.com`

Checks passed: 14/14

- PASS - published pages return 2xx: 10/10
- PASS - starter guide webhook accepted: lead_magnet_processed
- PASS - mango interest webhook accepted: offer_click_processed
- PASS - reservation/order simulation accepted: {"action":"order_processed","shippingDecision":"HOLD","operatorDisposition":"DO_NOT_CREATE_LABEL"}
- PASS - review webhook accepted: review_processed
- PASS - referral webhook accepted: referral_processed
- PASS - vip/show-qr lead webhook accepted: Show VIP Availability List
- PASS - fresh buyer contact exists: V5iekNz0xAt4m9EVuqM6
- PASS - fresh buyer has expected journey tags: journey:lead-captured-webhook, message:starter-guide-sent, journey:offer-presented, journey:purchased, status:customer, journey:advocacy, review:received
- PASS - fresh buyer custom fields updated: {"species_interest":"Crested Gecko","animal_interest":"Mango - Harlequin Dalmatian","offer_name":"Animal Reservation Deposit","purchase_status":"Deposit Paid","last_purchase_amount":75,"shipping_status":"Label Blocked","customer_journey_stage":"Advocacy","next_best_action":"Ask for referral, photo permission, and VIP list opt-in"}
- PASS - fresh buyer opportunities present: [{"name":"Ship LiveQA Buyer - Mango weather review","pipelineId":"0Z5i1khH6dQ7nswcRbtJ","stageId":"7db1f42c-3aa6-42e1-966f-c3f6948a5ae6","status":"open"},{"name":"LiveQA Buyer - Mango reservation completed","pipelineId":"KNlWC9LQSgxgTgwBARJO","stageId":"6d1c2b21-b524-4a24-8745-422abdeb883d","status":"open"},{"name":"LiveQA Buyer","pipelineId":"EXKPs1QvBp3GI8gE7Bl6","stageId":"e7685e9b-850d-4f7f-bbe0-d75ca6cf03dd","status":"open"}]
- PASS - fresh buyer email/message records present: 4
- PASS - referral contact isolated from generic drip: {"id":"LeyMAmiidol4qmVcQOYZ","tags":["source:referral","referral:received","journey:referral-captured","status:new-lead","status:referred-lead","interest:crested-gecko"]}
- PASS - vip/show-qr contact tagged: {"id":"opnGNGPyQCQYjw7DH8sB","tags":["journey:lead-captured-webhook","message:starter-guide-sent","status:new-lead","source:published-vip-page","interest:crested-gecko","offer:show-vip","source:show-qr","campaign:availability-alerts"]}

JSON evidence: `docs\demo-showroom\published-demo-liveqa-20260607195758.json`

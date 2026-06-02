param(
  [string]$BaseUrl = "http://localhost:3000"
)

$Payloads = @'
{
  "leadMagnet": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "firstName": "Demo",
    "email": "demo.lead@example.com",
    "phone": "+14045550199",
    "species_interest": "Crested Gecko",
    "source": "website",
    "offerKey": "crested_gecko_starter_guide"
  },
  "offerClicked": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "email": "demo.lead@example.com",
    "species_interest": "Crested Gecko",
    "animalInterest": "Mango - Harlequin Dalmatian",
    "offerKey": "animal_reservation"
  },
  "orderSubmitted": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "firstName": "Demo",
    "lastName": "Buyer",
    "email": "demo.lead@example.com",
    "phone": "+14045550199",
    "species_interest": "Crested Gecko",
    "animalInterest": "Mango - Harlequin Dalmatian",
    "productName": "Animal Reservation Deposit",
    "amount": 75,
    "purchaseStatus": "Deposit Paid",
    "destinationZip": "30339",
    "shippingAddress": {
      "address1": "100 Buyer Street",
      "city": "Atlanta",
      "state": "GA",
      "postalCode": "30339",
      "countryCode": "US",
      "residential": true
    },
    "preferredShipDate": "2026-06-08"
  },
  "reviewSubmitted": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "email": "demo.lead@example.com",
    "species_interest": "Crested Gecko",
    "rating": 5
  },
  "referral": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "firstName": "Referral",
    "email": "referral.lead@example.com",
    "phone": "+14045550198",
    "species_interest": "Crested Gecko",
    "referralSource": "Demo Lead"
  },
  "operatorGate": {
    "contactId": "optional-ghl-contact-id",
    "species": "crested_gecko",
    "originZip": "27601",
    "destinationZip": "30339",
    "preferredShipDate": "2026-06-08",
    "profileKey": "crestedGecko",
    "shipper": {
      "contact": {
        "personName": "Sarah Mitchell",
        "phoneNumber": "+19195550100",
        "companyName": "SunScale Geckos",
        "email": "sarah@sunscalegeckos.com"
      },
      "address": {
        "streetLines": [
          "123 Breeder Lane"
        ],
        "city": "Raleigh",
        "stateOrProvinceCode": "NC",
        "postalCode": "27601",
        "countryCode": "US"
      }
    },
    "recipient": {
      "contact": {
        "personName": "Demo Buyer",
        "phoneNumber": "+14045550199",
        "email": "demo.lead@example.com"
      },
      "address": {
        "streetLines": [
          "100 Buyer Street"
        ],
        "city": "Atlanta",
        "stateOrProvinceCode": "GA",
        "postalCode": "30339",
        "countryCode": "US",
        "residential": true
      }
    }
  },
  "orderShippingReview": {
    "locationId": "fqj4rbp2VRkvMa8GWVWn",
    "contactId": "optional-ghl-contact-id",
    "customer": {
      "firstName": "Demo",
      "lastName": "Buyer",
      "email": "demo.lead@example.com",
      "phone": "+14045550199"
    },
    "order": {
      "id": "DEMO-ORDER-1001",
      "productName": "Animal Reservation Deposit",
      "amount": 75,
      "purchaseStatus": "Deposit Paid",
      "species_interest": "Crested Gecko",
      "animalInterest": "Mango - Harlequin Dalmatian"
    },
    "shippingAddress": {
      "address1": "100 Buyer Street",
      "city": "Atlanta",
      "state": "GA",
      "postalCode": "30339",
      "countryCode": "US",
      "residential": true
    },
    "preferredShipDate": "2026-06-08"
  }
}
'@ | ConvertFrom-Json

function Invoke-DemoWebhook {
  param(
    [string]$Name,
    [string]$Path,
    [object]$Payload
  )

  $Uri = "$BaseUrl$Path"
  Write-Host ""
  Write-Host "== $Name =="
  Write-Host $Uri

  try {
    $Body = $Payload | ConvertTo-Json -Depth 30
    $Result = Invoke-RestMethod -Method Post -Uri $Uri -ContentType "application/json" -Body $Body
    $Result | ConvertTo-Json -Depth 12
  } catch {
    Write-Host "Request failed: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
      Write-Host $_.ErrorDetails.Message
    }
  }
}

Write-Host "Checking $BaseUrl/health"
Invoke-RestMethod -Method Get -Uri "$BaseUrl/health" | ConvertTo-Json -Depth 5

Invoke-DemoWebhook -Name "Lead Magnet" -Path "/webhooks/ghl/lead-magnet" -Payload $Payloads.leadMagnet
Invoke-DemoWebhook -Name "Offer Clicked" -Path "/webhooks/ghl/offer-clicked" -Payload $Payloads.offerClicked
Invoke-DemoWebhook -Name "Order Submitted" -Path "/webhooks/ghl/order-submitted" -Payload $Payloads.orderSubmitted
Invoke-DemoWebhook -Name "Order Shipping Review" -Path "/webhooks/shipping/order-review" -Payload $Payloads.orderShippingReview
Invoke-DemoWebhook -Name "Review Submitted" -Path "/webhooks/ghl/review-submitted" -Payload $Payloads.reviewSubmitted
Invoke-DemoWebhook -Name "Referral" -Path "/webhooks/ghl/referral" -Payload $Payloads.referral

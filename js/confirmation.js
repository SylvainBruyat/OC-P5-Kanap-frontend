const ORDER_ID = new URL(document.URL).searchParams.get("orderid");

document.getElementById("orderId").textContent = ORDER_ID;
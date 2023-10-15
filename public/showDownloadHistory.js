document.addEventListener("DOMContentLoaded", async   function() {
    const downloadHistoryButton = document.getElementById("showDownloadHistory");
    const logOut = document.getElementById("logOutLink");
    const token = localStorage.getItem("token");

    const decodeToken = parseJwt(token);
    function parseJwt(token) {
        var base64Url = token.split(".")[1];
        var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        var jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map(function (c) {
              return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
            })
            .join("")
        );
    
        return JSON.parse(jsonPayload);
      }

      if (decodeToken.premium) {
        const premiummessage = document.getElementById("premiumVersion");
    premiummessage.innerHTML = "(PREMIUM)";
      
        try {
    const response = await axios.get(
      "/expenses/download-expense-history",
      { headers: { Authorization: token } }
    );
     
    if (
      response.data &&
      response.data.downloadHistory &&
      Array.isArray(response.data.downloadHistory)) {
      const downloadHistory = response.data.downloadHistory;
      const tableBody = document.getElementById("expenseTableBody");

         tableBody.innerHTML = "";

      downloadHistory.forEach((history, index) => {
        const row = tableBody.insertRow();
    const numberCell = row.insertCell(0);
    const urlCell = row.insertCell(1);
    const downloadDateCell = row.insertCell(2);

    numberCell.textContent = index + 1;
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(
      new Blob([response.data], { type: "text/plain" })
    );
    anchor.textContent = 'expenses.txt';
    anchor.download = 'expenses.txt';
    urlCell.appendChild(anchor);

  

    const downloadDate= history.downloadedAt;
    if (downloadDate) {
        const datePartArray = downloadDate.split('T');
        const dateOnly = datePartArray[0];
        downloadDateCell.textContent = dateOnly;
      } else { 
        console.error('Invalid date value:', downloadDate);
        
        downloadDateCell.textContent = 'Invalid Date';
      }


    } )
 } else {
       
          console.log("invalid response data structure");
        
      }
  } catch (error) {
    console.error(
      "An error occurred while fetching downloading expenses history:",
      error
    );
  }
}else {
  alert('You are not pro user')
}
});



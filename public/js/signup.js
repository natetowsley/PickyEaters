document.querySelector("#passwordInput").addEventListener("click", suggestedPassword);
document.querySelector("#").addEventListener("click", inputCheck);
async function suggestedPassword() {
    console.log("in pass")
    let url = "https://csumb.space/api/suggestedPassword.php?length=8";
    try{
        let response = await fetch(url);
        try{
        let data = await response.json();
        console.log(data)
        document.querySelector("#suggest").textContent = " "+data.password;
        }catch(parseError){
            console.log("JSON Parsing Error "+ parseError);
        }
    }catch(error){
        console.log("Network error "+ error);
    }
}
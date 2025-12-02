document.querySelector("#detailsBtn").addEventListener("click", show);

async function show() {
    var myModal = new bootstrap.Modal(document.getElementById('detailsModal'));
    myModal.show();
}

document.addEventListener("DOMContentLoaded", function() {
    verificarErroDeAutenticacao();
});

function verificarErroDeAutenticacao() {
    // Verifica se a URL contém o parâmetro '?error', que é injetado pelo Spring Security em caso de falha
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('error')) {
        const mensagemErro = document.getElementById('mensagemErro');
        if (mensagemErro) {
            mensagemErro.style.display = 'block';
        }
    }
}
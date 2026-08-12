const form = document.getElementById('form-clima');
const inputCidade = document.getElementById('cidade');
const resultado = document.getElementById('resultado');

form.addEventListener("submit", async (event) => {

    // Impede a atualização da página ao enviar o formulário
    event.preventDefault();

    // Obtém o valor do campo de entrada e remove espaços em branco no início e no final
    const cidade = inputCidade.value.trim();

    // Verifica se o campo de entrada está vazio e retorna se estiver para evitar chamadas desnecessárias
    if(!cidade) {
        return;
    }

    try {

        const coordenadas = await buscarCoordenadas(cidade);

        const clima = await buscarClima(
            coordenadas.latitude,
            coordenadas.longitude
        );

        exibirClima(coordenadas.nome, clima);

    } catch (error) {

        resultado.innerHTML = `<p>${error.message}</p>`;

        console.error(error);
    }

    await buscarCoordenadas(cidade);

    //const coordenadas = await buscarCoordenadas(cidade);

    //console.log(cidade);

    //console.log(coordenadas);

});

async function buscarCoordenadas(cidade) {

    // Constrói a URL da API de geocodificação com o nome da cidade fornecido
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

    // Faz uma requisição à API de geocodificação para obter as coordenadas da cidade
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao buscar a cidade.");
    }

    // Converte a resposta da API em formato JSON
    const dados = await response.json();

    if (!dados.results || dados.results.length === 0) {
        throw new Error("Cidade não encontrada.");
    }

    const cidadeEncontrada = dados.results[0];

    return {
        nome: cidadeEncontrada.name,
        latitude: cidadeEncontrada.latitude,
        longitude: cidadeEncontrada.longitude
    };


    //const latitude = dados.results[0].latitude;
    //const longitude = dados.results[0].longitude;

    /*return {
        latitude,
        longitude
    }*/

}

async function buscarClima(latitude, longitude) {

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Erro ao buscar os dados do clima.");
    }

    const dados = await response.json();

    return dados.current;
}

function exibirClima(cidade, clima) {

    resultado.innerHTML = `
        <h2>${cidade}</h2>
        <p>Temperatura atual: ${clima.temperature_2m} °C</p>
    `;
}

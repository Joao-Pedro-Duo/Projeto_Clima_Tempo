if (typeof document !== "undefined") {

    const form = document.getElementById('form-clima');
    const inputCidade = document.getElementById('cidade');

    const buscaContainer = document.getElementById('busca-container');
    const resultadoContainer = document.getElementById('resultado-container');

    const temperatura = document.getElementById('temperatura');
    const localizacao = document.getElementById('localizacao');
    const descricaoClima = document.getElementById('descricao-clima');
    const dataConsulta = document.getElementById('data-consulta');
    const iconeClima = document.getElementById('icone-clima');

    const mensagemErro = document.getElementById('mensagem-erro');
    const botaoVoltar = document.getElementById('botao-voltar');


    form.addEventListener("submit", async (event) => {

        // Impede o recarregamento da página
        event.preventDefault();

        // Obtém a cidade digitada
        const cidade = inputCidade.value.trim();

        if (!cidade) {
            return;
        }

        // Limpa possíveis mensagens de erro anteriores
        mensagemErro.innerHTML = "";

        try {

            const coordenadas = await buscarCoordenadas(cidade);

            const clima = await buscarClima(
                coordenadas.latitude,
                coordenadas.longitude
            );

            exibirClima(coordenadas, clima);

        } catch (error) {

            mensagemErro.innerHTML = `
                <p class="erro">
                    ${error.message}
                </p>
            `;

            console.error(error);
        }


    });

    botaoVoltar.addEventListener("click", () => {

    resultadoContainer.classList.add("hidden");

    buscaContainer.classList.remove("hidden");

    inputCidade.value = "";

    mensagemErro.innerHTML = "";

    inputCidade.focus();
});

}

async function consultarClima(cidade) {

    const cidadeTratada =
        typeof cidade === "string"
            ? cidade.trim()
            : "";

    if (!cidadeTratada) {
        throw new Error("Informe o nome de uma cidade.");
    }

    const coordenadas =
        await buscarCoordenadas(cidadeTratada);

    const clima = await buscarClima(
        coordenadas.latitude,
        coordenadas.longitude
    );

    return {
        cidade: coordenadas.nome,
        pais: coordenadas.pais,
        latitude: coordenadas.latitude,
        longitude: coordenadas.longitude,

        temperatura: clima.temperature_2m,
        weatherCode: clima.weather_code,
        isDay: clima.is_day,
        dataHora: clima.time,

        descricao:
            obterDescricaoClima(clima.weather_code)
    };
}

async function buscarCoordenadas(cidade) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

    try {

        const response = await fetchComTimeout(url);

        if (response.status === 429) {
        throw new Error(
            "Limite de requisições excedido.");
        }

        if (!response.ok) {
            throw new Error("Falha da API de geolocalização.");
        }

        const dados = await response.json();

        if (!dados.results || dados.results.length === 0) {
            throw new Error("Cidade não encontrada. Tente novamente.");
        }

        const cidadeEncontrada = dados.results[0];

        return {
            nome: cidadeEncontrada.name,
            pais: cidadeEncontrada.country,
            latitude: cidadeEncontrada.latitude,
            longitude: cidadeEncontrada.longitude
        };

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error("Erro de conexão. Verifique sua internet.");
        }

        throw error;
    }
}


async function buscarClima(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day&timezone=auto`;

    try {

        const response = await fetchComTimeout(url);

        if (response.status === 429) {
        throw new Error(
            "Limite de requisições excedido.");
        }

        if (!response.ok) {
            throw new Error("Falha da API de previsão do tempo.");
        }

        const dados = await response.json();

        if (
            !dados.current ||
            dados.current.temperature_2m === undefined ||
            dados.current.weather_code === undefined ||
            dados.current.is_day === undefined ||
            dados.current.time === undefined
        ) {
            throw new Error("Formato inesperado da resposta da API.");
        }

        return dados.current;

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error("Erro de conexão. Verifique sua internet.");
        }

        throw error;
    }
}


function obterDescricaoClima(codigo) {

    if (codigo === 0) {
        return "Céu limpo";
    }

    if (codigo === 1) {
        return "Predominantemente limpo";
    }

    if (codigo === 2) {
        return "Parcialmente nublado";
    }

    if (codigo === 3) {
        return "Nublado";
    }

    if (codigo === 45 || codigo === 48) {
        return "Neblina";
    }

    if ([51, 53, 55, 56, 57].includes(codigo)) {
        return "Garoa";
    }

    if ([61, 63, 65, 66, 67].includes(codigo)) {
        return "Chuva";
    }

    if ([71, 73, 75, 77].includes(codigo)) {
        return "Neve";
    }

    if ([80, 81, 82].includes(codigo)) {
        return "Pancadas de chuva";
    }

    if ([85, 86].includes(codigo)) {
        return "Pancadas de neve";
    }

    if ([95, 96, 99].includes(codigo)) {
        return "Tempestade";
    }

    return "Condição desconhecida";
}


function obterIconeClima(codigo, isDay) {

    if (codigo === 0) {
        return isDay === 1
            ? "wi-day-sunny"
            : "wi-night-clear";
    }

    if (codigo === 1 || codigo === 2) {
        return isDay === 1
            ? "wi-day-cloudy"
            : "wi-night-alt-cloudy";
    }

    if (codigo === 3) {
        return "wi-cloudy";
    }

    if (codigo === 45 || codigo === 48) {
        return "wi-fog";
    }

    if ([51, 53, 55, 56, 57].includes(codigo)) {
        return "wi-sprinkle";
    }

    if ([61, 63, 65, 66, 67].includes(codigo)) {
        return "wi-rain";
    }

    if ([71, 73, 75, 77].includes(codigo)) {
        return "wi-snow";
    }

    if ([80, 81, 82].includes(codigo)) {
        return "wi-showers";
    }

    if ([85, 86].includes(codigo)) {
        return "wi-snow";
    }

    if ([95, 96, 99].includes(codigo)) {
        return "wi-thunderstorm";
    }

    return "wi-cloud";
}

async function fetchComTimeout(url, timeout = 5000) {

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    try {

        const response = await fetch(
            url,
            {
                signal: controller.signal
            }
        );

        return response;

    } catch (error) {

        if (error.name === "AbortError") {
            throw new Error(
                "Tempo limite da requisição excedido."
            );
        }

        if (error instanceof TypeError) {
            throw new Error(
                "Erro de rede. Verifique sua conexão."
            );
        }

        throw error;

    } finally {

        clearTimeout(timeoutId);
    }
}

function formatarData(data) {

    const dataFormatada = new Date(data);

    return dataFormatada.toLocaleString(
        "pt-BR",
        {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function alterarTema(isDay) {

    if (isDay === 1) {

        document.body.classList.remove("tema-noite");
        document.body.classList.add("tema-dia");

    } else {

        document.body.classList.remove("tema-dia");
        document.body.classList.add("tema-noite");
    }
}


function exibirClima(coordenadas, clima) {

    const descricao = obterDescricaoClima(
        clima.weather_code
    );

    const icone = obterIconeClima(
        clima.weather_code,
        clima.is_day
    );

    temperatura.textContent =
        `${Math.round(clima.temperature_2m)}°`;

    localizacao.textContent =
        `${coordenadas.nome}, ${coordenadas.pais}`;

    descricaoClima.textContent = descricao;

    dataConsulta.textContent =
        formatarData(clima.time);

    iconeClima.className =
        `wi ${icone}`;

    alterarTema(clima.is_day);

    buscaContainer.classList.add("hidden");
    resultadoContainer.classList.remove("hidden");
}

if (
    typeof module !== "undefined" &&
    module.exports
) {
    module.exports = {
        consultarClima,
        buscarCoordenadas,
        buscarClima,
        fetchComTimeout,
        obterDescricaoClima
    };
}
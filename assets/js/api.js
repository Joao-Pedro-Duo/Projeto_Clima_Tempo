/**
 * @fileoverview
 * Responsável pela consulta e tratamento de dados meteorológicos
 * utilizando as APIs de Geocodificação e Previsão do Tempo
 * da Open-Meteo.
 *
 * O arquivo também contém funções responsáveis pelo tratamento
 * de erros, interpretação dos códigos meteorológicos e atualização
 * da interface da aplicação.
 */


const GEOCODING_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const TIMEOUT_API = 10000;


const possuiDOM = typeof document !== "undefined";

const form = possuiDOM
    ? document.getElementById("form-clima")
    : null;

const inputCidade = possuiDOM
    ? document.getElementById("cidade")
    : null;

const buscaContainer = possuiDOM
    ? document.getElementById("busca-container")
    : null;

const resultadoContainer = possuiDOM
    ? document.getElementById("resultado-container")
    : null;

const temperatura = possuiDOM
    ? document.getElementById("temperatura")
    : null;

const localizacao = possuiDOM
    ? document.getElementById("localizacao")
    : null;

const descricaoClima = possuiDOM
    ? document.getElementById("descricao-clima")
    : null;

const dataConsulta = possuiDOM
    ? document.getElementById("data-consulta")
    : null;

const iconeClima = possuiDOM
    ? document.getElementById("icone-clima")
    : null;

const mensagemErro = possuiDOM
    ? document.getElementById("mensagem-erro")
    : null;

const botaoVoltar = possuiDOM
    ? document.getElementById("botao-voltar")
    : null;

const previsaoDias = possuiDOM
    ? document.getElementById("previsao-dias")
    : null;


if (form) {
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
}

if(botaoVoltar) {
    botaoVoltar.addEventListener("click", () => {

    resultadoContainer.classList.add("hidden");

    buscaContainer.classList.remove("hidden");

    inputCidade.value = "";

    mensagemErro.innerHTML = "";

    inputCidade.focus();
    });
}


/**
 * Consulta as informações meteorológicas de uma cidade.
 *
 * @async
 * @param {string} cidade - Nome da cidade pesquisada.
 * @returns {Promise<Object>} Objeto contendo localização e
 * informações meteorológicas atuais.
 *
 * @throws {Error} Se o nome da cidade estiver vazio.
 * @throws {Error} Se a cidade não for encontrada.
 * @throws {Error} Se ocorrer falha na API ou na conexão.
 *
 * @example
 * const clima = await consultarClima("São Paulo");
 * console.log(clima.temperatura);
 */
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
            obterDescricaoClima(clima.weather_code),

        previsao: clima.daily
    };
}


/**
 * Busca as coordenadas geográficas de uma cidade.
 *
 * @async
 * @param {string} cidade - Nome da cidade pesquisada.
 * @returns {Promise<Object>} Objeto contendo nome, país,
 * latitude e longitude.
 *
 * @throws {Error} Se a cidade não for encontrada.
 * @throws {Error} Se o limite de requisições for excedido.
 * @throws {Error} Se ocorrer falha na API.
 *
 * @example
 * const coordenadas =
 *     await buscarCoordenadas("São Paulo");
 *
 * console.log(coordenadas.latitude);
 */
async function buscarCoordenadas(cidade) {

    const url =
        `${GEOCODING_API}?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`;

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

}


/**
 * Busca os dados meteorológicos atuais de uma localização.
 *
 * @async
 * @param {number} latitude - Latitude da localização.
 * @param {number} longitude - Longitude da localização.
 * @returns {Promise<Object>} Dados meteorológicos atuais.
 *
 * @throws {Error} Se o limite de requisições for excedido.
 * @throws {Error} Se ocorrer falha na API.
 * @throws {Error} Se a resposta possuir formato inesperado.
 *
 * @example
 * const clima =
 *     await buscarClima(-23.55, -46.63);
 *
 * console.log(clima.temperature_2m);
 */
async function buscarClima(latitude, longitude) {

    const url =
    `${WEATHER_API}` +
    `?latitude=${latitude}` +
    `&longitude=${longitude}` +
    `&current=temperature_2m,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=5` +
    `&timezone=auto`;

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
            dados.current.time === undefined ||
            !dados.daily ||
            !Array.isArray(dados.daily.time) ||
            !Array.isArray(dados.daily.weather_code) ||
            !Array.isArray(dados.daily.temperature_2m_max) ||
            !Array.isArray(dados.daily.temperature_2m_min)
        ) {
            throw new Error("Formato inesperado da resposta da API.");
        }

        return {
            ...dados.current,
            daily: dados.daily
        };

    } catch (error) {

        if (error instanceof TypeError) {
            throw new Error("Erro de conexão. Verifique sua internet.");
        }

        throw error;
    }
}

/**
 * Exibe a previsão meteorológica dos próximos dias.
 *
 * @param {Object} daily - Dados diários retornados pela Open-Meteo.
 * @returns {void}
 */
function exibirPrevisaoDias(daily) {

    previsaoDias.innerHTML = "";

    for (
        let indice = 1;
        indice < daily.time.length;
        indice++
    ) {

        const data =
            formatarDataPrevisao(
                daily.time[indice]
            );

        const codigo =
            daily.weather_code[indice];

        const temperaturaMaxima =
            Math.round(
                daily.temperature_2m_max[indice]
            );

        const temperaturaMinima =
            Math.round(
                daily.temperature_2m_min[indice]
            );

        const descricao =
            obterDescricaoClima(codigo);

        const icone =
            obterIconeClima(codigo, 1);


        const card =
            document.createElement("article");

        card.classList.add("previsao-card");


        card.innerHTML = `
            <div class="previsao-data">

                <strong>
                    ${data.diaSemana}
                </strong>

                <span>
                    ${data.dataCompleta}
                </span>

            </div>


            <div class="previsao-clima">

                <i class="wi ${icone}"></i>

                <span>
                    ${descricao}
                </span>

            </div>


            <div class="previsao-temperaturas">

                <span class="temperatura-maxima">
                    ▲ ${temperaturaMaxima}°
                </span>

                <span class="temperatura-minima">
                    ▼ ${temperaturaMinima}°
                </span>

            </div>
        `;


        previsaoDias.appendChild(card);
    }
}


/**
 * Converte o código meteorológico em uma descrição textual.
 *
 * @param {number} codigo -
 * Código meteorológico retornado pela Open-Meteo.
 *
 * @returns {string} Descrição da condição meteorológica.
 *
 * @example
 * obterDescricaoClima(3);
 * // Retorna "Nublado"
 */
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


/**
 * Obtém a classe do ícone correspondente ao clima.
 *
 * @param {number} codigo -
 * Código meteorológico retornado pela API.
 *
 * @param {number} isDay -
 * Indica se é dia (1) ou noite (0).
 *
 * @returns {string} Classe CSS da biblioteca Weather Icons.
 *
 * @example
 * obterIconeClima(0, 1);
 * // Retorna "wi-day-sunny"
 */
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


/**
 * Executa uma requisição HTTP com limite de tempo.
 *
 * @async
 * @param {string} url - URL que será consultada.
 * @param {number} [timeout=10000] -
 * Tempo máximo da requisição em milissegundos.
 *
 * @returns {Promise<Response>} Resposta HTTP da requisição.
 *
 * @throws {Error} Se a requisição ultrapassar o tempo limite.
 * @throws {Error} Se ocorrer um erro de rede.
 *
 * @example
 * const response =
 *     await fetchComTimeout(
 *         "https://api.exemplo.com",
 *         5000
 *     );
 */
async function fetchComTimeout(url, timeout = TIMEOUT_API) {

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
                "A consulta demorou mais que o esperado. Tente novamente."
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


/**
 * Formata uma data e hora para português do Brasil.
 *
 * @param {string} data - Data e hora no formato ISO.
 * @returns {string} Data e hora formatadas.
 *
 * @example
 * formatarData("2026-08-12T16:15");
 */
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


/**
 * Formata uma data da previsão diária.
 *
 * @param {string} data - Data no formato YYYY-MM-DD.
 * @returns {Object} Dia da semana e data formatada.
 *
 * @example
 * formatarDataPrevisao("2026-08-14");
 */
function formatarDataPrevisao(data) {

    const dataFormatada =
        new Date(`${data}T12:00:00`);

    const diaSemana =
        dataFormatada.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long"
            }
        );

    const dataCompleta =
        dataFormatada.toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "long"
            }
        );

    return {
        diaSemana,
        dataCompleta
    };
}


/**
 * Altera o tema visual de acordo com o período do dia.
 *
 * @param {number} isDay -
 * Indica se é dia (1) ou noite (0).
 *
 * @returns {void}
 *
 * @example
 * alterarTema(0);
 * // Aplica o tema noturno.
 */
function alterarTema(isDay) {

    if (isDay === 1) {

        document.body.classList.remove("tema-noite");
        document.body.classList.add("tema-dia");

    } else {

        document.body.classList.remove("tema-dia");
        document.body.classList.add("tema-noite");
    }
}


/**
 * Exibe os dados meteorológicos na interface.
 *
 * @param {Object} coordenadas -
 * Informações da localização.
 *
 * @param {string} coordenadas.nome -
 * Nome da cidade.
 *
 * @param {string} coordenadas.pais -
 * Nome do país.
 *
 * @param {Object} clima -
 * Dados meteorológicos atuais.
 *
 * @param {number} clima.temperature_2m -
 * Temperatura atual.
 *
 * @param {number} clima.weather_code -
 * Código da condição meteorológica.
 *
 * @param {number} clima.is_day -
 * Indica se é dia ou noite.
 *
 * @param {string} clima.time -
 * Data e hora dos dados.
 *
 * @returns {void}
 *
 * @example
 * exibirClima(
 *     { nome: "São Paulo", pais: "Brasil" },
 *     {
 *         temperature_2m: 24,
 *         weather_code: 3,
 *         is_day: 1,
 *         time: "2026-08-12T16:15"
 *     }
 * );
 */
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

    // Exibir as próximas previsões de dias
    exibirPrevisaoDias(clima.daily);

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
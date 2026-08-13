# 🌤️ Projeto Clima

Aplicação web de **Previsão do Tempo** desenvolvida com **HTML, CSS e JavaScript**, utilizando a **Open-Meteo API** para consultar informações meteorológicas de diferentes cidades.

O projeto foi desenvolvido com foco no consumo de APIs, manipulação do DOM, tratamento de erros, responsividade, testes automatizados com Jest e documentação de código com JSDoc.

## 🚀 Funcionalidades

A aplicação permite:

- Pesquisar uma cidade pelo nome;
- Obter latitude e longitude através da API de Geocodificação da Open-Meteo;
- Consultar a temperatura atual;
- Exibir a descrição da condição climática;
- Exibir ícones de acordo com o clima;
- Mostrar o nome da cidade e do país;
- Exibir data e horário da consulta;
- Alterar o fundo da aplicação de acordo com o período do dia;
- Identificar cidades inexistentes;
- Tratar falhas das APIs;
- Tratar erros de rede;
- Controlar o tempo limite das requisições;
- Tratar limite de requisições;
- Identificar alterações inesperadas na resposta da API.

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript
- Fetch API
- Open-Meteo API
- Weather Icons
- Jest
- Node.js
- npm
- Git
- GitHub
- JSDoc

## 🌐 APIs Utilizadas

### Open-Meteo Geocoding API

Responsável por converter o nome da cidade informada pelo usuário em coordenadas geográficas.

```text
Nome da cidade
      ↓
Geocoding API
      ↓
Latitude + Longitude
```

### Open-Meteo Weather API

Utiliza a latitude e longitude obtidas anteriormente para consultar os dados meteorológicos atuais.

```text
Latitude + Longitude
         ↓
Open-Meteo Weather API
         ↓
Temperatura
Código do clima
Dia ou noite
Data e horário
```

## ☀️ Condições Meteorológicas

A aplicação interpreta o código meteorológico retornado pela Open-Meteo e apresenta descrições como:

- Céu limpo
- Predominantemente limpo
- Parcialmente nublado
- Nublado
- Neblina
- Garoa
- Chuva
- Neve
- Pancadas de chuva
- Pancadas de neve
- Tempestade

Os ícones correspondentes são exibidos utilizando a biblioteca **Weather Icons**.

## 🌙 Tema Dinâmico

A aplicação utiliza a informação `is_day` retornada pela API para identificar se a consulta corresponde ao período diurno ou noturno.

Com isso, o plano de fundo da aplicação é alterado automaticamente:

- ☀️ Tema claro durante o dia;
- 🌙 Tema escuro durante a noite.

## 📁 Estrutura do Projeto

```text
projeto_clima/
│
├── assets/
│   │
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   └── api.js
│   │
│   └── weather-icons/
│       ├── css/
│       └── font/
│
├── tests/
│   └── api.test.js
│
├── index.html
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

## ▶️ Como Executar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/Joao-Pedro-Duo/Projeto_Clima_Tempo.git
```

### 2. Acesse a pasta do projeto

```bash
cd Projeto_Clima_Tempo
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Execute a aplicação

Abra o arquivo `index.html` diretamente no navegador ou utilize uma extensão como **Live Server** no Visual Studio Code.

Depois:

1. Digite o nome de uma cidade;
2. Clique em **Buscar**;
3. Aguarde a consulta;
4. Visualize os dados meteorológicos.

## 🧪 Testes Automatizados

O projeto utiliza o **Jest** para realização de testes unitários.

Para executar:

```bash
npm test
```

Atualmente são validados **7 cenários**:

1. Nome de cidade válido retorna dados meteorológicos;
2. Nome de cidade inexistente lança exceção tratada;
3. Entrada vazia gera erro de validação;
4. Falha da API gera resposta adequada;
5. Limite de requisições excedido é tratado;
6. Conexão lenta gera timeout;
7. Mudança inesperada no formato da resposta JSON é identificada.

Resultado esperado:

```text
Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

## 🎭 Mocks nos Testes

Os testes utilizam **mocks do Jest** para simular as respostas da Fetch API.

Isso permite testar diferentes situações sem realizar requisições reais para a Open-Meteo.

Entre os cenários simulados estão:

- Resposta bem-sucedida;
- Cidade inexistente;
- Erro interno da API;
- Erro de rede;
- Timeout;
- Limite de requisições;
- Estrutura JSON inesperada.

Dessa forma, os testes são mais rápidos, previsíveis e independentes da disponibilidade de serviços externos.

## ⚠️ Tratamento de Erros

A aplicação possui tratamento para diferentes situações, incluindo:

- Campo de cidade vazio;
- Cidade não encontrada;
- Falha na API de geolocalização;
- Falha na API meteorológica;
- Limite de requisições excedido;
- Erro de conexão;
- Requisição acima do tempo limite;
- Resposta da API em formato inesperado.

As mensagens são exibidas de forma amigável na interface para informar o usuário sobre o problema ocorrido.

## ⏱️ Timeout

As requisições utilizam `AbortController` para controlar o tempo máximo de espera da Fetch API.

Caso a requisição ultrapasse o limite configurado, ela é cancelada e uma mensagem de erro é apresentada ao usuário.

## 📱 Responsividade

A interface foi construída utilizando CSS responsivo para funcionar em diferentes tamanhos de tela.

O layout é compatível com:

- Desktop;
- Tablets;
- Smartphones.

## 📚 Documentação do Código

As principais funções do arquivo `api.js` estão documentadas utilizando o padrão **JSDoc**.

A documentação contém informações sobre:

- Objetivo das funções;
- Parâmetros;
- Tipos dos parâmetros;
- Valores retornados;
- Exceções;
- Funções assíncronas;
- Exemplos de utilização.

Exemplo:

```javascript
/**
 * Busca as coordenadas geográficas de uma cidade.
 *
 * @async
 * @param {string} cidade - Nome da cidade pesquisada.
 * @returns {Promise<Object>} Objeto contendo nome, país,
 * latitude e longitude.
 * @throws {Error} Se a cidade não for encontrada.
 */
async function buscarCoordenadas(cidade) {
    // ...
}
```

## 🔄 Fluxo da Aplicação

```text
Usuário informa uma cidade
            ↓
Validação da entrada
            ↓
Open-Meteo Geocoding API
            ↓
Latitude + Longitude
            ↓
Open-Meteo Weather API
            ↓
Dados meteorológicos
            ↓
Tratamento dos dados
            ↓
Descrição + Ícone + Temperatura
            ↓
Atualização da interface
```

## 🌱 Possíveis Melhorias Futuras

- Previsão para os próximos dias;
- Temperatura máxima e mínima;
- Umidade relativa do ar;
- Velocidade do vento;
- Probabilidade de chuva;
- Histórico de cidades pesquisadas;
- Busca através da localização atual do usuário;
- Favoritar cidades;
- Testes automatizados da interface;
- Melhorias de acessibilidade;
- Deploy da aplicação.

## 🎯 Objetivo do Projeto

O projeto foi desenvolvido com finalidade educacional para colocar em prática conceitos de:

- Desenvolvimento Front-End;
- JavaScript assíncrono;
- Fetch API;
- Consumo de APIs REST;
- Manipulação do DOM;
- Tratamento de exceções;
- Testes unitários;
- Mocks;
- Git e GitHub;
- Documentação de código;
- Uso de Inteligência Artificial como apoio ao desenvolvimento.

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais.
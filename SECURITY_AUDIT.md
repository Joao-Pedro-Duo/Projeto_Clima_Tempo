# Auditoria de Segurança e Privacidade

## Escopo

A auditoria considera a aplicação web de previsão do tempo desenvolvida
com HTML, CSS e JavaScript, utilizando a API Open-Meteo e testes com Jest.

## Dados tratados

A aplicação recebe apenas o nome da cidade informado pelo usuário para
realizar consultas meteorológicas.

A implementação atual não utiliza banco de dados, localStorage ou cookies
para armazenar o histórico de pesquisas.

As informações necessárias para a consulta são enviadas à Open-Meteo.

## Riscos identificados

### 1. Inserção dinâmica de conteúdo HTML

Foi identificado uso de `innerHTML` para apresentação de mensagens.

Mitigação aplicada:

- Utilização de `textContent`;
- Criação dos elementos através de `document.createElement()`.

Isso reduz o risco de interpretação indevida de conteúdo como HTML.

### 2. Comunicação com serviços externos

As requisições são realizadas exclusivamente através de HTTPS.

As APIs utilizadas são:

- Open-Meteo Geocoding API;
- Open-Meteo Weather API.

### 3. Timeout

As requisições utilizam AbortController para evitar que conexões
permaneçam indefinidamente abertas.

### 4. Limite de requisições

A aplicação trata respostas HTTP 429 e apresenta uma mensagem
adequada ao usuário.

### 5. Credenciais

A versão atual utiliza a API pública da Open-Meteo e não possui
credenciais ou chaves armazenadas no código.

Caso futuramente seja utilizada uma API que exija chave privada,
a chave não deverá ser armazenada diretamente no JavaScript do
Frontend.

## Privacidade

A aplicação não mantém um histórico próprio das cidades pesquisadas.

Entretanto, as solicitações são enviadas para um serviço externo.
Portanto, o tratamento realizado pela Open-Meteo também deve ser
considerado na política de privacidade da aplicação.

## Recomendações para Produção

- Utilizar HTTPS;
- Evitar armazenamento desnecessário de dados;
- Não incluir credenciais privadas no Frontend;
- Implementar Content Security Policy;
- Manter dependências atualizadas;
- Executar auditorias periódicas das dependências;
- Validar entradas recebidas do usuário;
- Utilizar textContent para conteúdo textual;
- Manter tratamento de timeout e erros HTTP.
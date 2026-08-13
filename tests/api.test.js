const {
    consultarClima,
    fetchComTimeout
} = require("../assets/js/api");

const fetchOriginal = global.fetch;

describe(
    "Testes Unitários - App de Clima",
    () => {

        beforeEach(() => {
            global.fetch = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
            global.fetch = fetchOriginal;
        });


        test(
            "1. Nome de cidade válido retorna dados meteorológicos",
            async () => {

                fetch
                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,

                        json: async () => ({
                            results: [
                                {
                                    name: "São Paulo",
                                    country: "Brasil",
                                    latitude: -23.55,
                                    longitude: -46.63
                                }
                            ]
                        })
                    })

                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,

                        json: async () => ({
                            current: {
                                temperature_2m: 24,
                                weather_code: 3,
                                is_day: 1,
                                time: "2026-08-12T16:15"
                            },

                            daily: {
                                time: [
                                    "2026-08-12",
                                    "2026-08-13",
                                    "2026-08-14",
                                    "2026-08-15",
                                    "2026-08-16"
                                ],

                                weather_code: [
                                    3,
                                    61,
                                    2,
                                    0,
                                    45
                                ],

                                temperature_2m_max: [
                                    25,
                                    24,
                                    27,
                                    29,
                                    22
                                ],

                                temperature_2m_min: [
                                    17,
                                    16,
                                    18,
                                    19,
                                    15
                                ]
                            }
                        })
                    });


                const resultado =
                    await consultarClima(
                        "São Paulo"
                    );


                expect(resultado)
                    .toMatchObject({

                        cidade: "São Paulo",
                        pais: "Brasil",
                        temperatura: 24,
                        descricao: "Nublado"
                    });


                expect(fetch)
                    .toHaveBeenCalledTimes(2);
            }
        );


        test(
            "2. Nome de cidade inexistente lança exceção tratada",
            async () => {

                fetch.mockResolvedValue({
                    ok: true,
                    status: 200,

                    json: async () => ({
                        results: []
                    })
                });


                await expect(
                    consultarClima(
                        "CidadeQueNaoExiste123"
                    )
                ).rejects.toThrow(
                    "Cidade não encontrada."
                );
            }
        );


        test(
            "3. Entrada vazia retorna erro de validação",
            async () => {

                await expect(
                    consultarClima("   ")
                ).rejects.toThrow(
                    "Informe o nome de uma cidade."
                );


                expect(fetch)
                    .not
                    .toHaveBeenCalled();
            }
        );


        test(
            "4. Falha da API gera resposta adequada",
            async () => {

                fetch.mockResolvedValue({
                    ok: false,
                    status: 500
                });


                await expect(
                    consultarClima("São Paulo")
                ).rejects.toThrow(
                    "Falha da API"
                );
            }
        );


        test(
            "5. Excesso de requisições deve ser bloqueado",
            async () => {

                fetch.mockResolvedValue({
                    ok: false,
                    status: 429
                });


                await expect(
                    consultarClima("São Paulo")
                ).rejects.toThrow(
                    "Limite de requisições excedido."
                );
            }
        );


        test(
            "6. Conexão lenta deve dar timeout",
            async () => {

                fetch.mockImplementation(
                    (url, options) => {

                        return new Promise(
                            (resolve, reject) => {

                                options.signal
                                    .addEventListener(
                                        "abort",
                                        () => {

                                            const erro =
                                                new Error(
                                                    "Abortado"
                                                );

                                            erro.name =
                                                "AbortError";

                                            reject(erro);
                                        }
                                    );
                            }
                        );
                    }
                );


                await expect(
                    fetchComTimeout(
                        "https://teste.com",
                        20
                    )
                ).rejects.toThrow(
                    "A consulta demorou mais que o esperado"
                );
            }
        );


        test(
            "7. API mudou e quebrou o formato",
            async () => {

                fetch
                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,

                        json: async () => ({
                            results: [
                                {
                                    name: "São Paulo",
                                    country: "Brasil",
                                    latitude: -23.55,
                                    longitude: -46.63
                                }
                            ]
                        })
                    })

                    .mockResolvedValueOnce({
                        ok: true,
                        status: 200,

                        json: async () => ({
                            temperatura: 24
                        })
                    });


                await expect(
                    consultarClima("São Paulo")
                ).rejects.toThrow(
                    "Formato inesperado"
                );
            }
        );

        test(
            "8. Retorna previsão diária com temperaturas máximas e mínimas",
            async () => {

                // Mock da API de geolocalização
                fetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,

                    json: async () => ({
                        results: [
                            {
                                name: "São Paulo",
                                country: "Brasil",
                                latitude: -23.55,
                                longitude: -46.63
                            }
                        ]
                    })
                });


                // Mock da API meteorológica
                fetch.mockResolvedValueOnce({
                    ok: true,
                    status: 200,

                    json: async () => ({
                        current: {
                            temperature_2m: 24,
                            weather_code: 3,
                            is_day: 1,
                            time: "2026-08-13T15:00"
                        },

                        daily: {
                            time: [
                                "2026-08-13",
                                "2026-08-14",
                                "2026-08-15",
                                "2026-08-16",
                                "2026-08-17"
                            ],

                            weather_code: [
                                3,
                                61,
                                2,
                                0,
                                45
                            ],

                            temperature_2m_max: [
                                25,
                                24,
                                27,
                                29,
                                22
                            ],

                            temperature_2m_min: [
                                17,
                                16,
                                18,
                                19,
                                15
                            ]
                        }
                    })
                });


                const resultado =
                    await consultarClima("São Paulo");


                expect(resultado.previsao)
                    .toBeDefined();


                expect(resultado.previsao.time)
                    .toHaveLength(5);


                expect(
                    resultado.previsao.temperature_2m_max
                ).toEqual(
                    [25, 24, 27, 29, 22]
                );


                expect(
                    resultado.previsao.temperature_2m_min
                ).toEqual(
                    [17, 16, 18, 19, 15]
                );


                expect(fetch)
                    .toHaveBeenCalledTimes(2);
            }
        );

    }
);
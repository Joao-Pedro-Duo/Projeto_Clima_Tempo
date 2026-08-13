const {
    consultarClima,
    fetchComTimeout
} = require("../assets/js/api");


describe(
    "Testes Unitários - App de Clima",
    () => {

        beforeEach(() => {

            global.fetch = jest.fn();

            jest.clearAllMocks();
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
                    "Tempo limite"
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

    }
);
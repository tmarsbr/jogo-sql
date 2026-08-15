# Aula 20 - Lab 1 - Preparando a Fonte de Dados - Parte 2_2.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:12:54

---

**[00:00]** Podemos agora fazer o upload dos arquivos.

**[00:11]** Nós já criamos o bucket no Google Storage, agora é só mandar os arquivos para lá.

**[00:17]** Então clique aqui neste link, fazer upload de arquivos, navega até a pasta onde você

**[00:23]** colocou os arquivos aí no seu computador, neste caso aqui estou no CAP05, pasta de dados,

**[00:29]** pode selecionar os 3 arquivos de uma vez.

**[00:32]** Clica no primeiro, pressiona a tecla shift, seleciona todos eles e clique em open.

**[00:38]** Aguarde alguns instantes, upload iniciado e pronto.

**[00:42]** Olha aí que coisa linda!

**[00:44]** Todos os arquivos já na nuvem, diretamente lá no GCP.

**[00:49]** Qual a vantagem disso que estamos fazendo?

**[00:52]** Eu vou poder criar e destruir o DW livremente sem comprometer a fonte de dados.

**[00:59]** Terão processos distintos.

**[01:01]** Eu posso ter um outro processo, por exemplo, para atualizar esses arquivos periodicamente,

**[01:07]** de acordo com o processo que eu tenho de criação do DW.

**[01:11]** Imagine que eu tenho arquivos sendo gerados todo dia, por conta de um processo ETL, com

**[01:17]** uma outra ferramenta.

**[01:19]** Eu pego exatamente o resultado desse processo, alimento aqui mesmo nesse bucket.

**[01:25]** Cada vez que eu criar o DW, ele vai ler esses arquivos, carregar as tabelas e pronto, o ambiente

**[01:30]** estará disponível para criação dos relatórios.

**[01:33]** E assim nós temos a fonte de dados devidamente configurada.

**[01:37]** Se agora você clicar no nome de um dos arquivos, observe que na informação que eu tenho para

**[01:45]** o arquivo, olha o que aparece aqui.

**[01:47]** Está vendo esse caminho?

**[01:49]** Veja se não é exatamente o caminho que eu coloquei aqui.

**[01:53]** Lab1, Mentf, observe que é exatamente este caminho.

**[01:58]** Cadê?

**[01:59]** GS, DSA, Modeling P1, Cliente DSA, CSV.

**[02:05]** Olha lá, exatamente o mesmo caminho.

**[02:07]** Pronto, só pegar isso aí, colocar no seu script e você está pronto para executar

**[02:12]** o processo de automação.

**[02:14]** Nos encontramos no próximo vídeo.

**[02:16]** Até lá.

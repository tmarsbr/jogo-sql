# Aula 25 - Lab 1 - Destruindo a Infraestrutura.mp4

> Transcrição automática via Whisper (modelo: medium, idioma: pt)
> Gerado em: 2026-07-15 18:21:42

---

**[00:00]** Já não precisamos mais do Datwhouse.

**[00:04]** Ele já cumpriu o seu objetivo, permitiu as análises,

**[00:08]** consultas com linguagem SQL.

**[00:10]** Podemos agora destruir o ambiente.

**[00:13]** Como fazemos isso?

**[00:15]** Volta lá para o Container Docker,

**[00:17]** que é exatamente o seu cliente.

**[00:19]** Vamos dar um Clear na tela.

**[00:21]** Setinha para cima, tira o Apply

**[00:23]** e coloca o container.

**[00:25]** Quando o comando for executado,

**[00:27]** ele vai pedir para você confirmar

**[00:29]** e tudo que estiver aqui será destruído.

**[00:32]** Eu vou inclusive sair aqui do BigQuery.

**[00:34]** Vou retornar para a página principal.

**[00:36]** Não é necessário salvar a query.

**[00:38]** Retorno para cá.

**[00:40]** E todo o ambiente do BigQuery será destruído.

**[00:43]** Terraform destroy.

**[00:45]** Pressiona Enter.

**[00:47]** Ele vai fazer o mesmo.

**[00:49]** Vamos ver como ele vai fazer isso.

**[00:51]** Terraform destroy.

**[00:53]** Pressiona Enter.

**[00:55]** Ele vai ler o arquivo de estado

**[00:57]** para verificar se o estado está consistente.

**[00:59]** E vai trazer um resumo completo para você.

**[01:02]** Olha lá.

**[01:03]** Observe que agora ele traz todos os parâmetros,

**[01:07]** todos os atributos de cada recurso.

**[01:09]** Nós não configuramos tudo isso.

**[01:11]** Quem definiu esses parâmetros?

**[01:13]** O GCP.

**[01:15]** No momento em que você enviou para o GCP,

**[01:18]** ele mesmo preencheu com valor padrão.

**[01:21]** Eu agora estou vendo esses valores

**[01:23]** porque agora eu vou deletar tudo isso.

**[01:25]** Ele mostra aqui um resumo completo para você.

**[01:28]** Dá uma olhada para ver se está tudo ok.

**[01:31]** Todos os comandos, tudo aquilo que será deletado.

**[01:34]** Veja que ele está lendo cada um dos recursos.

**[01:37]** Excelente.

**[01:38]** Perfeito.

**[01:39]** Então agora é só confirmar.

**[01:41]** Atenção.

**[01:42]** IES.

**[01:43]** Pressiona Enter.

**[01:44]** Ele então vai destruir e pronto.

**[01:46]** Destruiu com imensa facilidade.

**[01:49]** Mas é isso mesmo.

**[01:50]** É isso o trabalho dele.

**[01:51]** Vamos ver se destruiu mesmo.

**[01:53]** Vem para cá.

**[01:54]** Acessa aqui o BigQuery.

**[01:56]** Observe que agora eu clicar na setinha.

**[01:58]** Não tem mais o dataset.

**[02:00]** Consequentemente, não tem mais as tabelas.

**[02:03]** Pronto.

**[02:04]** DW destruído com sucesso.

**[02:06]** Mas lá no Storage, os arquivos continuam.

**[02:09]** Então clica aqui no menu de navegação.

**[02:11]** Cloud Storage.

**[02:12]** Buckets.

**[02:13]** Acessa lá o que você criou.

**[02:15]** DSA Modeling 1.

**[02:16]** O nome que você deu.

**[02:18]** E pronto.

**[02:19]** Os arquivos estão aqui intactos.

**[02:20]** Então a qualquer momento, se eu quiser criar de novo esse DW, é só aplicar o Terraform

**[02:26]** Apply.

**[02:27]** Só isso.

**[02:28]** Ele vai criar tudo de novo.

**[02:29]** Normal.

**[02:30]** Vamos testar?

**[02:31]** Já que estamos aqui mesmo, aproveita a oportunidade.

**[02:33]** Então Terraform Destroi.

**[02:35]** Agora Terraform Apply de novo.

**[02:37]** Veja que ele vai pedir para você confirmar.

**[02:39]** IES.

**[02:40]** Só você fazer a confirmação.

**[02:42]** Agora em alguns instantes.

**[02:43]** Pronto.

**[02:44]** O que você deu a ele?

**[02:45]** Ele está com o seu DW.

**[02:46]** Volta para cá.

**[02:47]** Vem aqui para a tela inicial.

**[02:49]** Vem aqui.

**[02:50]** Big Query.

**[02:51]** Observe que agora.

**[02:52]** Clica na setinha.

**[02:54]** Já aparece de novo lá o seu data set.

**[02:57]** Excelente.

**[02:58]** Clica aqui nos três pontinhos.

**[02:59]** Query.

**[03:00]** Preencha aqui com um asterisco.

**[03:02]** E então executa.

**[03:03]** Aguarde alguns instantes e pronto.

**[03:05]** Os dados estão lá disponíveis novamente.

**[03:07]** Então eu posso destruir, por exemplo, na sexta-noite.

**[03:11]** E aí dependendo do serviço que eu estiver usando, eu não pago final de semana.

**[03:15]** Porque não tem ninguém usando, porque eu vou ficar pagando.

**[03:17]** No domingo de noite ou na segunda de manhã, eu crio novamente.

**[03:21]** As pessoas vão trabalhar durante a semana, por exemplo.

**[03:24]** Por exemplo, quando eu for na sexta-feira, destrói.

**[03:26]** Tem empresa que destrói à noite.

**[03:28]** Porque dependendo do serviço, você paga pelas horas de uso.

**[03:32]** Se não está usando, para que vai manter ligado?

**[03:35]** Ambiente em nuvem, novos tempos.

**[03:37]** Então vamos destruir mais uma vez.

**[03:39]** Vou sair daqui sem salvar.

**[03:41]** Vai para a parte principal.

**[03:43]** Vem para cá.

**[03:44]** Dá um cria na tela.

**[03:45]** Cetinha para cima.

**[03:47]** Terraform destrói.

**[03:49]** O Terraform foi construído para isso.

**[03:51]** Então ele vai criar e destruir.

**[03:53]** Criar e destruir.

**[03:54]** Detalhes.

**[03:55]** Também pode modificar.

**[03:56]** Então às vezes você usou o apply.

**[03:59]** A infraestrutura foi criada.

**[04:01]** Você tem que mudar um parâmetro.

**[04:03]** Você pode alterar o seu main.tf.

**[04:05]** E aplicar de novo.

**[04:07]** Terraform apply.

**[04:08]** Ele vai só atualizar aquele parâmetro que você modificou.

**[04:11]** Ou um recurso que você quer adicionar.

**[04:13]** E assim por diante.

**[04:14]** Digita IES.

**[04:15]** Pressiona enter.

**[04:16]** E pronto.

**[04:17]** Destruído mais uma vez.

**[04:19]** Vamos lá conferir.

**[04:20]** Vem para cá.

**[04:21]** Big query.

**[04:22]** Clica aqui na setinha.

**[04:24]** E pronto.

**[04:25]** Não tenho mais o data set.

**[04:26]** Acabou.

**[04:27]** DWA encerrado com sucesso.

**[04:29]** Vamos concluir esse lab no próximo vídeo.

**[04:32]** Eu faço o encerramento junto com você.

**[04:34]** Muito obrigado e até lá.

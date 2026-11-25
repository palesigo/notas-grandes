# Notas Grandes

PWA em português europeu para escrever notas no iPad com um teclado integrado. Não requer conta, servidor, dependências de npm nem compilação. Funciona offline depois de a aplicação preparar os ficheiros na primeira abertura com ligação.

## Utilização

- Começa a escrever na primeira nota. A aplicação guarda o texto neste iPad à medida que escreves. Usa **Nova nota** para escrever outra e **As minhas notas** para voltar a uma nota anterior.
- O modo normal usa o teclado QWERTY. Ativa **Teclas XL** para usar letras em ordem alfabética, com menos colunas e teclas maiores. Usa **Acentos** para aceder a `á`, `ã`, `é` e afins; o `ç` está em **Letras**. **Maiúsculas** mantém-se ativo até voltares a tocar.
- **Desfazer** recupera a última alteração de texto feita na nota aberta. O histórico de desfazer não é guardado ao fechar a app ou trocar de nota. As setas movem a posição de escrita. Um teclado físico também pode escrever no campo de texto; para usar o teclado virtual do iPad, ativa-o em **Opções e cópias de segurança**.
- Usa **Guardar cópia (.json)** para exportar todas as notas. **Importar cópia** acrescenta notas, sem substituir as existentes; ignora textos exatamente iguais. **Exportar nota (.txt)** guarda só o texto da nota atual. Estes ficheiros não são cifrados.
- O GitHub aloja o código, não as notas. Não coloques os ficheiros de backup no repositório. Limpar os dados da app pode apagar as notas. Se publicares a app noutro endereço, faz uma cópia antes e importa-a na nova instalação.

## Executar no computador

Na pasta do projeto, executa `python -m http.server 8000` (ou `python3 -m http.server 8000`) e abre `http://localhost:8000/`. Não abras `index.html` diretamente a partir do Explorador/Finder.

Com Node.js 20 ou posterior, executa `node --test` para verificar a edição de texto e o formato da cópia de segurança. Não há instalação de dependências.

## Publicar no GitHub Pages

1. Cria um repositório, por exemplo `notas-grandes`. Coloca os ficheiros na raiz de `main` (o `index.html` deve estar visível na primeira página do repositório). Inclui `.nojekyll` e a pasta `icons`.
2. Em **Settings → Pages → Build and deployment**, escolhe **Deploy from a branch**, depois **main** e **/ (root)**. Carrega em **Save**.
3. Abre o endereço indicado em **Settings → Pages**. O nome do repositório pode ser diferente: as referências aos ficheiros são relativas.
4. No Safari do iPad, abre esse endereço. Toca em **Partilhar → Adicionar ao ecrã principal**, ativa **Abrir como app web** se disponível e toca em **Adicionar**.
5. Abre a app pelo novo ícone antes de começar a guardar notas. Aguarda a indicação **Disponível offline**. Testa em modo de voo com o Wi-Fi desligado.

## Teste no iPad antes da utilização regular

1. Em horizontal e vertical, escreve `Olá, João!` e muda de linha. Experimenta QWERTY e XL. Observa se a pessoa consegue escrever e corrigir com conforto sem tocar nas teclas vizinhas.
2. Apaga uma letra e usa **Desfazer**. Move a posição de escrita com as setas e insere uma letra a meio da frase. Experimenta a leitura das teclas e os comandos com VoiceOver, se a pessoa o usar.
3. Escreve duas notas, fecha a app e confirma que ambas aparecem ao reabrir. Repete em modo de voo.
4. Exporta uma cópia para Ficheiros e importa-a; confirma que não são criados duplicados. Testa a recuperação num ambiente separado antes de depender dos backups.

## Atualizações

Ao alterar ficheiros públicos, incrementa `v1` em `sw.js` (nome da cache) e publica todos os ficheiros em conjunto. Se houver uma atualização a aguardar, fecha os separadores/instâncias da app que ainda executam a versão anterior e reabre. Não alteres a chave `STORAGE` só por publicar uma nova versão.

# Projeto feito para a loja Santa Motoca
Projeto de faculdade criado para um comercio real. O sistema é um gerenciador de estoque e comercio, permitindo trazer ordem e observabilidade para operações de lojas.


## Requisitos e tutorial de instalação
- npm https://www.youtube.com/watch?v=tC90frbS7kk
- wls (se for ambiente windows) https://www.youtube.com/watch?v=o1_E4PBl30s
- docker https://www.youtube.com/watch?v=qrvx6ivyrQw&t=190s

</br>

<details>
<summary>Passo a passo para rodar em modo de desenvolvimento</summary>

### Um

Clone o diretorio do github:
```bash
git clone https://github.com/userNickLoad/oficina-santa-moto.git
```
Mude para o diretorio do projeto:
```bash
cd oficina-santa-moto
```
Caso você esteja logado no git por ssh (aquele jeito que o andre ensinou):
```bash
git remote add origin git@github.com:userNickLoad/oficina-santa-moto.git
```
Caso você esteja logado no git por http (quando aparece o chrome para vc logar):
```bash
git remote add origin https://github.com/userNickLoad/oficina-santa-moto.git
```

### Dois

Crie um arquivo `.env` na pasta raiz do projeto com o seguinte conteúdo:

```dotenv
# Plataforma
APP_PORT=3000

# PostgreSQL
BD_PORT=5433
BD_USER=postgres
# Senha de exemplo para ambiente local.
BD_PASSWORD=123

# Redis
REDIS_PORT=6379
# Senha de exemplo para ambiente local.
REDIS_PASSWORD=123
```

### Três

Crie um arquivo `.gitignore` na pasta raiz do projeto com o seguinte conteúdo:

```gitignore
# Environment variables
.env
.env.*
!.env.example

# PostgreSQL local
*.dump
*.backup

# Logs
*.log

# Node.js
node_modules/
dist/

#prisma
/plataforma/generated
```

### Quatro

Pelo terminal, acesse o WSL, inicie o Docker e os containers:

```bash
wsl
systemctl start docker
docker compose up -d
```

### Cinco
Vai para o diretorio da plataforma e instala todas as dependencias:
```bash
cd plataforma
npm install
```

### Seis
Gera os arquivos do prisma (para isso os passos Quatro e Cinco são essenciais):
```bash
npx prisma generate
```

### Sete
Crie um novo terminal e sertifique-se que ele esteja na pasta da plataforma e rode o comando a baixo para poder utilizar o tailwind
```bash
npx @tailwindcss/cli -i ./src/public/css/input.css -o ./src/public/css/output.css --watch
```

### Ultimo
Volte para o primeiro terminal e faça o comando usado para rodar a plataforma em modo de desenvolvedor:
```bash
npm run dev
```
Para descobrir outros modos de rodar a aplicação acesso o arquivo plataforma/packge.json

</details>

</br>

<details>
<summary>Comandos básicos de git para fazer features</summary>

### git pull origin main
Sempre que você for criar uma nova branch apartir da principal, rode esse comando antes.
</br>


### git branch
Mostra as branchs presentes no seu computador e a branch em que você se encontra.
</br>

### git checkout -b <nome_da_branch>
Para criar uma nova branch, certifique-se que você está na branch que você deseja usar como base.
</br>

### git checkout <nome_da_branch>
Muda para uma branch existente.
</br>

### git add . ou git add <nome_da_pasta_ou_arquivo>
Adiciona todos os arquivos (menos os do .gitignore) a area de staging ou adiciona apenas aquele arquivo que você queria mudar.
</br>

### git push origin <nome_da_branch>
Priorize subir para o github apenas branchs que não sejam a main e faça pull requests pelo site do github (do mesmo jeito que o andré mostrou), para podermos administrar melhor as os possiveis conflitos de merge
</br>

</details>

## Desenvolvedores
- Nicolas Gaiovicz Avila https://github.com/userNickLoad
- Vitoria Martins https://github.com/vitoriamartins00
- Maria Eduarda https://github.com/mehnotme

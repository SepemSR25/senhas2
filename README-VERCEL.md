# Sistema de Senhas SEPEM - Deploy no Vercel

## Passo a Passo para Deploy Gratuito no Vercel

### 1. Preparação do Código
✅ Projeto já configurado para Vercel com `vercel.json`
✅ Arquivos de build otimizados
✅ Logo SEPEM integrado

### 2. Deploy no Vercel

**Opção A - Via GitHub (Recomendado):**

1. **Criar repositório no GitHub:**
   - Vá para [github.com](https://github.com) e faça login
   - Clique em "New repository"
   - Nome: `sistema-senhas-sepem`
   - Deixe público (gratuito)
   - Clique "Create repository"

2. **Upload do código:**
   - Baixe todos os arquivos do projeto
   - Use o GitHub web interface para upload
   - Ou clone e faça push via Git

3. **Deploy no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique "Sign up" e entre com GitHub
   - Clique "New Project"
   - Selecione seu repositório `sistema-senhas-sepem`
   - Clique "Deploy"

**Opção B - Upload Direto:**

1. **Acesse [vercel.com](https://vercel.com)**
2. **Faça cadastro gratuito**
3. **Clique "New Project"**
4. **Selecione "Upload folder"**
5. **Faça upload de todos os arquivos do projeto**
6. **Clique "Deploy"**

### 3. Configurações no Vercel

**Environment Variables (se necessário):**
- `NODE_ENV=production`

**Build Settings:**
- Framework: Other
- Build Command: `npm run build`
- Output Directory: `dist/public`

### 4. Após o Deploy

Você receberá um link permanente tipo:
`https://sistema-senhas-sepem.vercel.app`

**Rotas disponíveis:**
- `/` - Geração de senhas
- `/dashboard` - Painel profissional  
- `/tv` - Display para TV

### 5. Características do Deploy Gratuito

✅ **100% Gratuito**
✅ **SSL automático** (HTTPS)
✅ **Link permanente**
✅ **Deploy automático** a cada atualização
✅ **Sem limite de tempo** ativo
✅ **Performance otimizada**

### 6. Limitações do Plano Gratuito
- 100GB de banda mensal (mais que suficiente)
- Execução limitada a 10 segundos por função
- 12 deploys por dia

## Suporte Técnico

Em caso de dúvidas durante o deploy:
1. Verifique se todos os arquivos foram enviados
2. Confirme as configurações de build
3. Consulte os logs de deploy no painel Vercel

**Sistema desenvolvido por Saulo Rodrigo REG. 36.364-8 - 2025**
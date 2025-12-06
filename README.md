# 💰 FinEdu - Educação e Controle Financeiro

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)

O **FinEdu** é uma aplicação web moderna para gestão financeira pessoal e familiar. Controle suas receitas, despesas, defina metas e acompanhe seu progresso com uma interface limpa e intuitiva.

## ✨ Funcionalidades Principais

- **📊 Dashboard Interativo:** Visão geral do saldo, receitas e despesas com gráficos dinâmicos.
- **📝 Gestão de Transações:** Adicione, edite e categorize suas movimentações financeiras.
- **🎯 Metas e Planos:** Defina objetivos financeiros (ex: Viagem, Reserva) e acompanhe o progresso.
- **👥 Multi-Responsável:** Atribua transações a diferentes membros da família (ou a você mesmo).
- **☁️ Nuvem:** Seus dados são salvos automaticamente e seguros no Supabase.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React](https://reactjs.org/) (Vite)
- **Estilização:** CSS Vanilla (Design System com Variáveis)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Backend/Banco de Dados:** [Supabase](https://supabase.com/)

## 🚀 Como Rodar o Projeto

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/seu-usuario/financeiro.git
    cd financeiro
    ```

2.  **Instale as dependências:**

    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com suas chaves do Supabase:

    ```env
    VITE_SUPABASE_URL=sua_url_supabase
    VITE_SUPABASE_KEY=sua_anon_key_supabase
    ```

4.  **Inicie o servidor de desenvolvimento:**

    ```bash
    npm run dev
    ```

5.  **Acesse:** Abra `http://localhost:5173` no navegador.

## 🗄️ Configuração do Banco de Dados

Rode o script SQL disponível em `src/db/schema.sql` no SQL Editor do seu projeto Supabase para criar as tabelas necessárias.

---

Desenvolvido com 💙 para organização financeira por Danilo Alves Pérez.

devwebwizards.com

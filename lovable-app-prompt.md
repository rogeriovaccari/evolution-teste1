# Prompt para Criação de App de Check-in de Treinos

## 📱 Visão Geral do Projeto

Crie um aplicativo web moderno e responsivo para gerenciamento de check-in de treinos de artes marciais, com sistema de progressão de faixas baseado em frequência.

---

## 🎯 Funcionalidades Principais

### 1. Sistema de Check-in Inteligente
- **Check-in geolocalizado**: Validar que o aluno está fisicamente na academia usando GPS
  - Definir um raio de tolerância (ex: 100 metros) da localização da escola
  - Bloquear check-in se GPS estiver desativado ou localização incorreta
  - Mostrar mensagem clara quando fora da área permitida
- **Horários das aulas**: Exibir grade de horários do dia/semana
  - Permitir check-in apenas 15 minutos antes e até 10 minutos após o início da aula
  - Destacar visualmente a próxima aula disponível
  - Filtrar aulas por modalidade/nível
- **Confirmação visual**: Feedback imediato após check-in bem-sucedido (animação + som opcional)
- **Histórico de check-ins**: Lista de todos os check-ins realizados com data, hora e aula

### 2. Dashboard de Frequência
Criar um painel visual atrativo com:
- **Card de estatísticas semanais**:
  - Número de treinos na semana atual
  - Meta semanal (configurável)
  - Barra de progresso visual
  - Streak (dias consecutivos treinando)

- **Card de estatísticas mensais**:
  - Total de presenças no mês
  - Comparação com mês anterior (% de melhoria)
  - Gráfico de barras por semana

- **Card de estatísticas anuais**:
  - Total de treinos no ano
  - Meses mais ativos
  - Gráfico de evolução mensal (linha ou barras)

- **Calendário visual**:
  - Marcar dias com treino (cor destaque)
  - Indicador de intensidade (quantidade de treinos por dia)

### 3. Sistema de Progressão de Faixas
- **Dashboard de progressão**:
  - Faixa atual do aluno
  - Próxima faixa com cores/ícones representativos
  - Barra de progresso até a próxima faixa
  - Requisitos detalhados (frequência mínima necessária)
  
- **Requisitos por faixa** (estrutura inicial - será personalizado depois):
  ```
  Branca → Cinza: 30 treinos
  Cinza → Amarela: 40 treinos
  Amarela → Laranja: 50 treinos
  Laranja → Verde: 60 treinos
  Verde → Azul: 70 treinos
  Azul → Roxa: 80 treinos
  Roxa → Marrom: 90 treinos
  Marrom → Preta: 100 treinos
  ```

- **Notificações de conquista**:
  - Alert quando atingir requisitos para nova faixa
  - Histórico de evolução de faixas
  - Tempo estimado para próxima faixa (baseado na frequência média)

### 4. Grade de Horários
- **Visualização semanal/diária** das aulas
- **Informações por aula**:
  - Horário de início e término
  - Modalidade/tipo de treino
  - Professor responsável
  - Nível da aula (iniciante, intermediário, avançado)
  - Vagas disponíveis (opcional)
- **Filtros**: Por dia, modalidade, professor
- **Notificações**: Lembrete antes da aula (30min ou personalizável)

### 5. Perfil do Aluno
- **Informações pessoais**:
  - Nome, foto, data de nascimento
  - Faixa atual e data de obtenção
  - Data de início na academia
  
- **Estatísticas gerais**:
  - Total de treinos desde o início
  - Média de treinos por semana
  - Melhor streak
  - Tempo total de prática

- **Configurações**:
  - Ativar/desativar notificações
  - Definir metas pessoais
  - Preferências de horário

---

## 🎨 Design e UX

### Paleta de Cores Sugerida
- **Primária**: Tons de azul escuro/roxo (transmite disciplina e confiança)
- **Secundária**: Laranja/amarelo (energia e motivação)
- **Sucesso**: Verde para check-ins realizados
- **Alerta**: Vermelho para avisos de localização/restrições
- **Neutros**: Cinza claro para fundos, preto para textos

### Componentes UI Modernos
- Cards com glassmorphism ou sombras suaves
- Botões com estados hover/active bem definidos
- Animações micro-interações (loading, sucesso, erro)
- Ícones intuitivos (Lucide icons ou similar)
- Gradientes sutis em headers e cards importantes
- Bottom navigation ou sidebar responsiva

### Layout Responsivo
- **Mobile-first**: Otimizado para smartphones
- **Tablet**: Aproveitar espaço com grid de 2 colunas
- **Desktop**: Layout de 3 colunas ou sidebar + conteúdo principal

---

## 🔧 Funcionalidades Técnicas

### Geolocalização
- Usar Geolocation API do navegador
- Implementar fallback para GPS desabilitado
- Calcular distância entre ponto atual e coordenadas da escola
- Armazenar coordenadas da academia em configuração

### Armazenamento de Dados
- Estado global para usuário logado (Context API ou Zustand)
- LocalStorage para cache de check-ins
- Simular backend com dados mocados (pode ser expandido com API real)

### Autenticação (simplificada para MVP)
- Tela de login básica
- Armazenar sessão em localStorage
- Perfis de teste pré-configurados

### Notificações
- Notificações do navegador (Web Notifications API)
- Lembretes de aulas
- Conquistas de faixas

---

## 📄 Páginas/Rotas Sugeridas

1. **`/login`** - Tela de autenticação
2. **`/dashboard`** - Home com resumo e estatísticas principais
3. **`/check-in`** - Página dedicada ao check-in com mapa/GPS
4. **`/horarios`** - Grade completa de horários
5. **`/frequencia`** - Dashboard detalhado de frequência (semanal, mensal, anual)
6. **`/progressao`** - Sistema de faixas e evolução
7. **`/perfil`** - Dados do aluno e configurações
8. **`/historico`** - Lista de todos os check-ins realizados

---

## 📊 Melhorias Inspiradas em Concorrentes

### Baseado em apps similares (Gympass, TotalPass, ClubReady, MindBody):

1. **Gamificação**:
   - Sistema de badges/conquistas (ex: "5 treinos consecutivos", "Guerreiro de fim de semana")
   - Ranking mensal de frequência (opcional, para motivação social)
   - Pontos por check-in que desbloqueiam recompensas

2. **Social Features**:
   - Ver amigos que também treinam
   - Compartilhar conquistas em redes sociais
   - Marcar amigos para treinar junto

3. **Insights Inteligentes**:
   - "Você treinou 20% mais este mês!"
   - "Seu melhor dia é terça-feira"
   - "Faltam X treinos para sua melhor marca mensal"

4. **Funcionalidades Extras**:
   - QR Code alternativo para check-in (caso GPS falhe)
   - Avaliação da aula após check-in (1-5 estrelas)
   - Anotações pessoais sobre o treino
   - Integração com wearables (futura expansão)

5. **Melhorias de Engajamento**:
   - Onboarding interativo para novos usuários
   - Tutorial visual na primeira vez
   - Mensagens motivacionais personalizadas
   - Desafios mensais (ex: "Complete 16 treinos este mês")

---

## 🚀 Diferenciais para Implementar

1. **Previsão de Progressão**: Algoritmo que estima quando o aluno atingirá próxima faixa baseado em frequência média
2. **Modo Offline**: Permitir visualizar horários e estatísticas sem internet
3. **Comparação Temporal**: Gráficos comparando frequência atual vs. meses anteriores
4. **Metas Personalizadas**: Aluno define quantos treinos quer fazer por semana
5. **Certificados Digitais**: Gerar certificado visual quando conquistar nova faixa

---

## 📱 Stack Técnico Recomendado (Lovable)

- **Framework**: React com TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Roteamento**: React Router
- **Estado**: Zustand ou Context API
- **Gráficos**: Recharts ou Chart.js
- **Ícones**: Lucide React
- **Animações**: Framer Motion
- **Datas**: date-fns
- **Mapas**: Leaflet ou Google Maps API (para visualização opcional)

---

## 🎬 Fluxo de Uso Principal

1. Aluno faz login
2. Vê dashboard com próxima aula e estatísticas
3. Clica em "Fazer Check-in"
4. App verifica GPS e localização
5. Se válido, permite confirmar check-in
6. Mostra animação de sucesso + atualiza estatísticas
7. Dashboard atualiza contadores e progresso de faixa em tempo real

---

## ✅ Critérios de Sucesso

- Interface intuitiva e rápida (< 2 segundos para check-in)
- Funcionamento confiável do GPS (99% de precisão)
- Motivação visual clara para progressão
- Responsivo em todos os dispositivos
- Acessibilidade (contraste, tamanhos de fonte adequados)

---

## 📝 Observações para Desenvolvimento

- Começar com dados mockados (JSON local)
- Criar 3-4 perfis de alunos exemplo com diferentes históricos
- Simular ~5 tipos de aulas diferentes
- Configurar coordenadas fixas para teste de GPS
- Implementar validações de formulário robustas
- Considerar PWA (Progressive Web App) para instalação no celular

---

## 🔮 Expansões Futuras (Fase 2)

- Backend real com Node.js/Python + banco de dados
- Painel administrativo para professores/gestores
- Sistema de pagamentos integrado
- Agendamento de aulas
- Chat entre alunos e professores
- Planos de treino personalizados
- Análise de desempenho com IA

---

**IMPORTANTE**: Crie um MVP funcional e visualmente atraente focado nas funcionalidades principais primeiro. A tabela de requisitos de faixas será ajustada posteriormente com valores reais fornecidos pelo cliente.

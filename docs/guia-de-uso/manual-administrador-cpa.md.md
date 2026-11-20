# Manual Operacional — Administrador da CPA

Este manual documenta todas as rotinas administrativas do **Portal CPA**, incluindo a abertura e o encerramento de pesquisas anuais, a publicação e edição de devolutivas, a gestão de relatórios em PDF e o controle de usuários e permissões.

---

## 1. Visão Geral do Painel Administrativo (`/inicio`)

Ao entrar com uma conta de **Administrador**, a tela inicial exibe o banner da pesquisa vigente e **6 atalhos operacionais**:

1. **Acessar:** redireciona para o link externo da pesquisa ativa (quando disponível para o perfil).
2. **Devolutivas:** consulta e gestão completa do mural de devolutivas (inclui o botão para criar novas respostas).
3. **Resultados:** visualização dos 4 painéis do Google Data Studio.
4. **Relatórios:** repositório de documentos com barra de upload e exclusão.
5. **CPAs:** cadastro, ativação e encerramento das pesquisas por perfil.
6. **Perfis:** criação, edição de cargos e exclusão de usuários.

---

## 2. Gestão de Pesquisas Anuais (`/cpas`)

Neste módulo você controla os links do Google Forms exibidos no botão **Acessar** da tela inicial para cada público.

### Como criar uma nova pesquisa CPA
1. Clique em **CPAs** na tela inicial.
2. Na barra superior, preencha:
   * **Título:** nome da campanha (ex.: *Pesquisa CPA 2026/2 Aberta*).
   * **Link do Google Forms:** URL completa do formulário de avaliação.
   * **Perfil permitido:** selecione o público-alvo (*Aluno*, *Professor*, *Coordenador*, *Avaliador Externo* ou *Administrador*).
   * **Ano:** informe o ano de referência (o sistema aceita valores de **2003** até o **ano atual**).
   * **Status inicial:** escolha *Ativa* ou *Encerrada*.
3. Clique em **Criar CPA**.

> **Regra de unicidade por perfil:** O portal permite apenas **1 CPA ativa por perfil simultaneamente**. Ao criar ou ativar uma pesquisa para determinado cargo (ex.: *Professor*), qualquer outra pesquisa que estivesse ativa para aquele mesmo cargo será encerrada automaticamente, mantendo o histórico preservado.

### Como ativar, encerrar ou excluir uma pesquisa
* Na lista abaixo do formulário, utilize o botão de alternância para **Ativar** ou **Encerrar** uma pesquisa a qualquer momento.
* Para remover um cadastro incorreto, clique em **Excluir** e confirme no segundo clique (**Confirmar?**).

---

## 3. Gestão de Devolutivas (`/devolutivas` e `/devolutivas/responder`)

### Como publicar uma nova devolutiva
1. Clique em **Devolutivas** na tela inicial.
2. Acione o botão de adição disponível na página para abrir a tela de cadastro (`/devolutivas/responder`).
3. Preencha os campos obrigatórios:
   * **Título:** resumo da demanda avaliada.
   * **Área responsável:** setor encarregado pela resposta (ex.: *Infraestrutura*, *TI*, *Secretaria*, *Coordenação*).
   * **Categoria:** status do atendimento (*Resolvido*, *Inapto* ou *Impertinente*).
   * **Destinatário da devolutiva:** selecione **Alunos**, **Professores** ou **Corpo funcional**.
   * **Motivo da resposta:** justificativa detalhada que será exibida ao usuário.
4. Envie o formulário para publicar no ano corrente.

> **Alcance hierárquico:** Ao destinar uma devolutiva para *Alunos* ou *Professores*, ela fica visível exclusivamente para aquele público e para os perfis de gestão (*Coordenador*, *Avaliador Externo* e *Administrador*). Já as devolutivas marcadas como *Corpo funcional* ficam restritas aos perfis de gestão.

### Como editar ou excluir uma devolutiva existente
1. Em **Devolutivas**, clique sobre o cartão do ano desejado.
2. Localize o item no mural e clique em **Ver resposta**.
3. No modal aberto, utilize os botões administrativos na parte inferior:
   * **Editar:** abre o formulário inline para alterar título, área, categoria, destinatário ou justificativa.
   * **Excluir:** solicita confirmação inline (**Sim, excluir**) antes de apagar o registro definitivamente.

---

## 4. Gestão de Relatórios e Boletins (`/relatorios`)

1. Clique em **Relatórios** na tela inicial.
2. **Para publicar:** preencha **Título**, **Tipo** (*Relatório de Autoavaliação* ou *Boletim Informativo*), **Ano**, anexe um arquivo **PDF** de até **4 MB** e clique para enviar.
3. **Para excluir:** clique em **Excluir** ao lado do documento e confirme em **Confirmar?**. O arquivo será removido tanto do banco de dados quanto do armazenamento do Supabase.

---

## 5. Controle de Usuários e Cargos (`/perfis`)

1. Clique em **Perfis** na tela inicial para gerenciar quem acessa o portal.
2. **Para cadastrar um novo usuário:**
   * Preencha **Nome**, **E-mail**, **Senha inicial** e selecione o **Cargo** (*Aluno*, *Professor*, *Coordenador*, *Avaliador Externo* ou *Administrador*).
   * Clique em **Criar Usuário**.
3. **Para editar ou remover um usuário:**
   * Altere diretamente o **Nome** ou o **Cargo** na linha do usuário e clique em **Salvar**.
   * Para revogar o acesso, clique em **Excluir** e confirme em **Confirmar?**.

> **Regra de validação de e-mail:** Para todos os perfis internos (*Aluno*, *Professor*, *Coordenador* e *Administrador*), o sistema exige que o endereço de e-mail contenha `impacta`. Apenas o cargo **Avaliador Externo** permite o cadastro de e-mails externos sem essa restrição.

---

## 6. Consulta aos Dashboards (`/resultados`)

* Para validar a exibição dos 4 painéis em `/resultados` (*Aluno(a) Presencial*, *Aluno(a) EAD*, *Professores* e *Corpo Técnico Administrativo*), certifique-se de estar logado no navegador com uma conta Google institucional `@impacta`.
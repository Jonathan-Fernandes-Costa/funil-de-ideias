# Estrutura do Banco de Dados - Supabase

Este documento define a estrutura das tabelas necessárias para o backend do **Funil de Ideias**, utilizando Supabase como banco de dados e backend.

---

## Visão Geral das Tabelas

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Usuários do sistema |
| `ideias` | Ideias submetidas no funil |
| `tags` | Tags disponíveis para categorização |
| `ideia_tags` | Relação N:N entre ideias e tags |
| `comentarios` | Comentários nas ideias |
| `votos` | Registro de votos por usuário |
| `anexos` | Arquivos anexados às ideias |
| `definicao_produto` | Detalhamento da definição do produto |
| `checklist_definicao` | Itens do checklist de definição |
| `avaliacoes` | Avaliações técnicas das ideias |

---

## 1. Tabela: `usuarios`

Armazena os usuários do sistema. Integra com Supabase Auth.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `UUID` | PK, DEFAULT `auth.uid()` | ID do usuário (vinculado ao Auth) |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | Email do usuário |
| `nome` | `VARCHAR(150)` | NOT NULL | Nome completo |
| `avatar_url` | `TEXT` | NULL | URL da foto de perfil |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de atualização |

---

## 2. Tabela: `ideias`

Tabela principal que armazena todas as ideias submetidas.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `BIGSERIAL` | PK | ID único da ideia |
| `titulo` | `VARCHAR(200)` | NOT NULL | Nome da ideia |
| `descricao` | `TEXT` | NOT NULL | Problema do cliente |
| `fonte` | `VARCHAR(150)` | NULL | Origem da ideia (ex: Feedback de Clientes) |
| `segmento` | `VARCHAR(100)` | NULL | Segmento alvo (ex: B2B, Varejo) |
| `impacto` | `TEXT` | NULL | Impacto esperado |
| `status` | `VARCHAR(50)` | NOT NULL, DEFAULT `'Geração'` | Status atual no funil |
| `autor_id` | `UUID` | FK → `usuarios.id`, NOT NULL | Quem criou a ideia |
| `owner_id` | `UUID` | FK → `usuarios.id`, NULL | Proprietário atual (quem assumiu ownership) |
| `justificativa_rejeicao` | `TEXT` | NULL | Motivo da rejeição (se arquivada) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de atualização |

### Status Possíveis (ENUM sugerido)
```sql
CREATE TYPE status_ideia AS ENUM (
  'Geração',
  'Em Definição', 
  'Pronta para Avaliação',
  'Aprovada',
  'Arquivada'
);
```

---

## 3. Tabela: `tags`

Catálogo de tags disponíveis para categorização.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `SERIAL` | PK | ID único da tag |
| `nome` | `VARCHAR(50)` | NOT NULL, UNIQUE | Nome da tag |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |

---

## 4. Tabela: `ideia_tags`

Relação muitos-para-muitos entre ideias e tags.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE | ID da ideia |
| `tag_id` | `INT` | FK → `tags.id`, ON DELETE CASCADE | ID da tag |

**Primary Key:** `(ideia_id, tag_id)`

---

## 5. Tabela: `comentarios`

Comentários feitos nas ideias.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `BIGSERIAL` | PK | ID único do comentário |
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE, NOT NULL | Ideia comentada |
| `autor_id` | `UUID` | FK → `usuarios.id`, NOT NULL | Autor do comentário |
| `conteudo` | `TEXT` | NOT NULL | Texto do comentário |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de atualização |

---

## 6. Tabela: `votos`

Registra votos dos usuários nas ideias (cada usuário pode votar uma vez por ideia).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE | ID da ideia |
| `usuario_id` | `UUID` | FK → `usuarios.id`, ON DELETE CASCADE | ID do usuário que votou |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data do voto |

**Primary Key:** `(ideia_id, usuario_id)`

---

## 7. Tabela: `anexos`

Arquivos anexados às ideias.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `BIGSERIAL` | PK | ID único do anexo |
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE, NOT NULL | Ideia relacionada |
| `nome_arquivo` | `VARCHAR(255)` | NOT NULL | Nome original do arquivo |
| `storage_path` | `TEXT` | NOT NULL | Caminho no Supabase Storage |
| `tipo_mime` | `VARCHAR(100)` | NULL | Tipo MIME do arquivo |
| `tamanho_bytes` | `BIGINT` | NULL | Tamanho em bytes |
| `uploaded_by` | `UUID` | FK → `usuarios.id`, NOT NULL | Quem fez upload |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de upload |

---

## 8. Tabela: `definicao_produto`

Detalhamento da Definição do Produto (aba Definição).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `BIGSERIAL` | PK | ID único |
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE, UNIQUE | Ideia (1:1) |
| `alinhamento_estrategico` | `TEXT` | NULL | Texto de encaixe organizacional |
| `capacidade_tecnica` | `BOOLEAN` | DEFAULT `FALSE` | Checklist: Capacidade técnica |
| `capacidade_operacional` | `BOOLEAN` | DEFAULT `FALSE` | Checklist: Capacidade operacional |
| `capacidade_recursos` | `BOOLEAN` | DEFAULT `FALSE` | Checklist: Recursos disponíveis |
| `publico_alvo` | `TEXT` | NULL | Público-alvo definido |
| `mercado` | `TEXT` | NULL | Análise de mercado |
| `hipoteses_valor` | `TEXT` | NULL | Hipóteses de valor |
| `estimativa_rentabilidade` | `TEXT` | NULL | Estimativa de rentabilidade |
| `progresso_percentual` | `INT` | DEFAULT `0`, CHECK (0-100) | % de completude do checklist |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |
| `updated_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de atualização |

---

## 9. Tabela: `checklist_definicao`

Itens customizáveis do checklist de definição (extensível).

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `SERIAL` | PK | ID único |
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE | Ideia relacionada |
| `categoria` | `VARCHAR(100)` | NOT NULL | Categoria (ex: "Encaixe Organizacional") |
| `item` | `VARCHAR(255)` | NOT NULL | Descrição do item |
| `concluido` | `BOOLEAN` | DEFAULT `FALSE` | Se foi marcado como concluído |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data de criação |

---

## 10. Tabela: `avaliacoes`

Avaliações técnicas das ideias prontas para avaliação.

| Coluna | Tipo | Constraints | Descrição |
|--------|------|-------------|-----------|
| `id` | `BIGSERIAL` | PK | ID único da avaliação |
| `ideia_id` | `BIGINT` | FK → `ideias.id`, ON DELETE CASCADE, NOT NULL | Ideia avaliada |
| `avaliador_id` | `UUID` | FK → `usuarios.id`, NOT NULL | Quem avaliou |
| `nota_clareza_objetivos` | `SMALLINT` | CHECK (1-5), NOT NULL | Nota: Clareza dos Objetivos |
| `nota_analise_negocio` | `SMALLINT` | CHECK (1-5), NOT NULL | Nota: Análise de Negócio |
| `nota_viabilidade_tecnica` | `SMALLINT` | CHECK (1-5), NOT NULL | Nota: Viabilidade Técnica |
| `nota_media` | `DECIMAL(3,2)` | GENERATED | Média das notas |
| `decisao` | `VARCHAR(20)` | NOT NULL | 'Aprovada' ou 'Arquivada' |
| `justificativa` | `TEXT` | NULL | Justificativa (obrigatória se rejeitada) |
| `created_at` | `TIMESTAMPTZ` | DEFAULT `NOW()` | Data da avaliação |

---

## Views Sugeridas

### `view_ideias_com_contadores`
View que retorna ideias com contagem de votos e comentários.

```sql
CREATE VIEW view_ideias_com_contadores AS
SELECT 
  i.*,
  COALESCE(v.total_votos, 0) AS votos,
  COALESCE(c.total_comentarios, 0) AS comentarios,
  ARRAY_AGG(t.nome) FILTER (WHERE t.nome IS NOT NULL) AS tags
FROM ideias i
LEFT JOIN (
  SELECT ideia_id, COUNT(*) AS total_votos 
  FROM votos GROUP BY ideia_id
) v ON i.id = v.ideia_id
LEFT JOIN (
  SELECT ideia_id, COUNT(*) AS total_comentarios 
  FROM comentarios GROUP BY ideia_id
) c ON i.id = c.ideia_id
LEFT JOIN ideia_tags it ON i.id = it.ideia_id
LEFT JOIN tags t ON it.tag_id = t.id
GROUP BY i.id, v.total_votos, c.total_comentarios;
```

---

## Políticas RLS (Row Level Security)

### Tabela `ideias`
```sql
-- Qualquer usuário autenticado pode ler
CREATE POLICY "Leitura pública de ideias" ON ideias
  FOR SELECT USING (auth.role() = 'authenticated');

-- Qualquer usuário autenticado pode criar
CREATE POLICY "Criação de ideias" ON ideias
  FOR INSERT WITH CHECK (auth.uid() = autor_id);

-- Autor ou owner pode atualizar
CREATE POLICY "Atualização de ideias" ON ideias
  FOR UPDATE USING (auth.uid() IN (autor_id, owner_id));
```

### Tabela `votos`
```sql
-- Usuário pode ver todos os votos
CREATE POLICY "Leitura de votos" ON votos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Usuário só pode votar como ele mesmo
CREATE POLICY "Criação de votos" ON votos
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Usuário pode remover seu próprio voto
CREATE POLICY "Remoção de votos" ON votos
  FOR DELETE USING (auth.uid() = usuario_id);
```

### Tabela `comentarios`
```sql
-- Qualquer autenticado pode ler
CREATE POLICY "Leitura de comentários" ON comentarios
  FOR SELECT USING (auth.role() = 'authenticated');

-- Criação apenas como autor
CREATE POLICY "Criação de comentários" ON comentarios
  FOR INSERT WITH CHECK (auth.uid() = autor_id);

-- Apenas autor pode editar/deletar
CREATE POLICY "Edição de comentários" ON comentarios
  FOR UPDATE USING (auth.uid() = autor_id);

CREATE POLICY "Deleção de comentários" ON comentarios
  FOR DELETE USING (auth.uid() = autor_id);
```

---

## Índices Recomendados

```sql
-- Busca por status (muito usado no Kanban e filtros)
CREATE INDEX idx_ideias_status ON ideias(status);

-- Busca por autor
CREATE INDEX idx_ideias_autor ON ideias(autor_id);

-- Ordenação por data
CREATE INDEX idx_ideias_created ON ideias(created_at DESC);

-- Comentários por ideia
CREATE INDEX idx_comentarios_ideia ON comentarios(ideia_id);

-- Votos por ideia
CREATE INDEX idx_votos_ideia ON votos(ideia_id);
```

---

## Storage Buckets

| Bucket | Descrição | Política |
|--------|-----------|----------|
| `anexos` | Arquivos anexados às ideias | Público para leitura, autenticado para upload |
| `avatars` | Fotos de perfil dos usuários | Público para leitura |

---

## Diagrama ER (Resumo)

```
usuarios (1) ─────< (N) ideias
    │                    │
    │                    ├──< comentarios
    │                    ├──< votos  
    │                    ├──< anexos
    │                    ├──< ideia_tags >── tags
    │                    ├─── definicao_produto (1:1)
    │                    ├──< checklist_definicao
    │                    └──< avaliacoes
    │
    └────────────────────────< (autor/avaliador)
```

---

## Próximos Passos

1. **Criar projeto no Supabase** (se ainda não existir)
2. **Executar migrations** para criar as tabelas
3. **Habilitar RLS** em todas as tabelas
4. **Configurar Storage** para anexos
5. **Criar funções RPC** para operações complexas (ex: votar, solicitar avaliação)
6. **Integrar front-end** com Supabase Client

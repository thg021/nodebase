# Documentação do Projeto - NodeBase

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Banco de Dados](#banco-de-dados)
- [Componentes UI](#componentes-ui)
- [Scripts Disponíveis](#scripts-disponíveis)

---

## 🚀 Sobre o Projeto

Projeto Next.js com TypeScript, Prisma ORM, shadcn-ui e Tailwind CSS.

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15.5.4** - Framework React
- **React 19.1.0** - Biblioteca UI
- **TypeScript 5** - Superset JavaScript tipado
- **Tailwind CSS 4** - Framework CSS utility-first
- **shadcn-ui 3.3.1** - Componentes UI (53 componentes instalados)

### Backend & Database
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados relacional
- **tsx** - Executor TypeScript para Node.js

### Dev Tools
- **Biome 2.2.0** - Linter e Formatter

---

## ⚙️ Configuração do Ambiente

### Variáveis de Ambiente (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
```

### Instalação

```bash
# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev
```

---

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx           # Página principal
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   └── ui/                # Componentes shadcn-ui
├── lib/
│   ├── db.ts             # Configuração Prisma Client
│   └── utils.ts          # Funções utilitárias
├── hooks/                 # Custom React Hooks
└── generated/
    └── prisma/           # Prisma Client gerado

prisma/
├── schema.prisma         # Schema do banco de dados
└── migrations/           # Histórico de migrations
```

---

## 🗄️ Banco de Dados

### Arquivo `schema.prisma` Explicado

O arquivo `prisma/schema.prisma` é o coração da configuração do Prisma. Vamos entender cada parte:

```prisma
// Gerador do Prisma Client
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

**`generator client`** - Define como o Prisma Client será gerado
- **`provider`**: Especifica que vamos usar o cliente JavaScript/TypeScript
- **`output`**: Define onde o código do cliente será gerado (`src/generated/prisma`)
  - Por padrão seria `node_modules/.prisma/client`
  - Customizamos para ter melhor controle e organização

```prisma
// Configuração do banco de dados
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**`datasource db`** - Configura a conexão com o banco de dados
- **`provider`**: Tipo do banco (postgresql, mysql, sqlite, sqlserver, mongodb)
- **`url`**: String de conexão vinda da variável de ambiente `DATABASE_URL`
  - Formato: `postgresql://usuario:senha@host:porta/database`

### Modelos (Models)

Os modelos definem a estrutura das suas tabelas no banco de dados:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

**Atributos dos campos:**
- **`@id`**: Define a chave primária
- **`@default(cuid())`**: Gera um ID único automaticamente (CUID = Collision-resistant Unique ID)
- **`@unique`**: Garante que o valor seja único (índice único no banco)
- **`?`**: Indica que o campo é opcional (pode ser null)
- **`@default(now())`**: Define o valor padrão como data/hora atual
- **`@updatedAt`**: Atualiza automaticamente quando o registro é modificado
- **`Post[]`**: Define um relacionamento 1:N (um usuário tem vários posts)

**Relacionamentos:**
```prisma
model Post {
  // ...outros campos
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
}
```

- **`@relation`**: Define o relacionamento entre tabelas
  - **`fields: [authorId]`**: Campo local que armazena a foreign key
  - **`references: [id]`**: Campo referenciado na tabela relacionada
  - **`onDelete: Cascade`**: Ao deletar um User, deleta todos os Posts relacionados

### Schema Prisma

O projeto utiliza PostgreSQL com as seguintes tabelas:

#### User
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  posts     Post[]
}
```

#### Post
```prisma
model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Comandos Prisma Úteis

```bash
# Abrir Prisma Studio (GUI para visualizar dados)
npx prisma studio

# Criar uma nova migration
npx prisma migrate dev --name nome_da_migration

# Resetar banco de dados (CUIDADO!)
npx prisma migrate reset

# Verificar status das migrations
npx prisma migrate status

# Gerar Prisma Client após mudanças no schema
npx prisma generate
```

### Uso do Prisma Client

```typescript
import { db } from "@/lib/db";

// Criar um usuário
const user = await db.user.create({
  data: {
    email: "usuario@exemplo.com",
    name: "Nome do Usuário"
  }
});

// Buscar todos os usuários com seus posts
const users = await db.user.findMany({
  include: {
    posts: true
  }
});

// Atualizar um usuário
const updatedUser = await db.user.update({
  where: { id: "user_id" },
  data: { name: "Novo Nome" }
});

// Deletar um usuário
await db.user.delete({
  where: { id: "user_id" }
});
```

### Por que usar `db.ts`? 🤔

O arquivo `src/lib/db.ts` é **ESSENCIAL** e resolve problemas críticos do Prisma Client com Next.js.

#### 📄 Código do arquivo `db.ts`:

```typescript
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

#### 🎯 Por que precisamos deste arquivo?

##### 1. **Problema: Múltiplas Instâncias do Prisma Client**

**❌ Sem `db.ts`** - Se você fizer isso:
```typescript
// arquivo1.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// arquivo2.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // NOVA instância!

// arquivo3.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // OUTRA instância!
```

**Resultado**: Cada import cria uma NOVA conexão com o banco de dados!

**Consequências:**
- 🔴 Esgota o pool de conexões do PostgreSQL
- 🔴 Erro: "Too many connections"
- 🔴 Performance degradada
- 🔴 Aplicação trava

**✅ Com `db.ts`** - Você importa sempre a MESMA instância:
```typescript
// Todos os arquivos importam a MESMA instância
import { db } from "@/lib/db";
```

##### 2. **Problema: Hot Reload do Next.js**

Durante o desenvolvimento, o Next.js usa **Hot Module Replacement (HMR)**:

**O que acontece:**
1. Você salva um arquivo
2. Next.js recarrega apenas o módulo modificado
3. Módulos importados são re-executados

**❌ Sem a proteção do `globalThis`**:
```typescript
// A cada hot reload, isso cria uma NOVA instância
export const db = new PrismaClient();
```

Após 5-10 salvamentos → **"Too many connections"** 💥

**✅ Com a proteção:**
```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

**Como funciona:**
1. **Primeiro carregamento**: `globalForPrisma.prisma` é `undefined` → cria nova instância
2. **Armazena no `globalThis`**: A instância fica salva globalmente
3. **Hot reload**: `globalForPrisma.prisma` já existe → reutiliza a mesma instância
4. **Produção**: Não precisa dessa lógica (sem hot reload)

##### 3. **O que é `globalThis`?**

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};
```

- **`globalThis`**: Objeto global que persiste entre hot reloads
  - No Node.js = `global`
  - No Browser = `window`
  - **Universal** = `globalThis`
- **Type assertion**: TypeScript não conhece `prisma` no `globalThis`, então fazemos casting
- **Armazenamento persistente**: A instância sobrevive aos hot reloads

##### 4. **Operador Nullish Coalescing (`??`)**

```typescript
export const db = globalForPrisma.prisma ?? new PrismaClient();
```

**Tradução**: "Use `globalForPrisma.prisma` SE existir, SENÃO crie novo `PrismaClient()`"

- Se `globalForPrisma.prisma` é `null` ou `undefined` → cria nova instância
- Se `globalForPrisma.prisma` já existe → reutiliza

##### 5. **Condicional de Ambiente**

```typescript
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

- **Em desenvolvimento**: Salva a instância no `globalThis`
- **Em produção**: Não precisa (não há hot reload)
- **Otimização**: Evita código desnecessário em produção

#### 📊 Comparação Visual

| Cenário | Sem `db.ts` | Com `db.ts` |
|---------|------------|-------------|
| **Imports em 5 arquivos** | 5 conexões | 1 conexão |
| **10 hot reloads** | 10 novas conexões | 1 conexão (reutilizada) |
| **Pool de conexões** | Esgota rapidamente | Sempre 1 conexão |
| **Performance** | Degradada | Ótima |
| **Erros** | "Too many connections" | Nenhum |

#### ✅ Benefícios do Padrão Singleton

1. **Evita múltiplas conexões** ao banco de dados
2. **Previne problemas com hot reload** em desenvolvimento
3. **Melhora a performance** reutilizando a mesma instância
4. **Centraliza a configuração** do Prisma Client
5. **Previne esgotamento do pool** de conexões
6. **Prática recomendada** pela documentação oficial do Prisma

#### 🚀 Como usar

```typescript
// ✅ SEMPRE faça isso
import { db } from "@/lib/db";

// Em qualquer lugar da aplicação
const users = await db.user.findMany();

// ❌ NUNCA faça isso
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient(); // NÃO!
```

#### 📚 Referências

- [Prisma Best Practices - Connection Management](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Next.js + Prisma Integration](https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices)

---

## 🎨 Componentes UI

### shadcn-ui Components Instalados (53)

O projeto inclui todos os componentes do shadcn-ui:

- **Forms**: Input, Textarea, Select, Checkbox, Radio Group, Switch, Slider
- **Data Display**: Table, Card, Badge, Avatar, Skeleton
- **Feedback**: Alert, Alert Dialog, Dialog, Drawer, Toast (Sonner)
- **Navigation**: Breadcrumb, Tabs, Navigation Menu, Menubar, Sidebar
- **Overlay**: Popover, Tooltip, Hover Card, Context Menu, Dropdown Menu
- **Layout**: Separator, Resizable, Scroll Area, Aspect Ratio
- **Advanced**: Calendar, Carousel, Chart, Command, Collapsible
- **Utilities**: Button, Button Group, Empty, Field, Item, KBD, Label, Progress, Spinner

### Exemplo de Uso

```typescript
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ExamplePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exemplo</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite algo..." />
        <Button>Enviar</Button>
      </CardContent>
    </Card>
  );
}
```

### Variantes de Componentes

#### Button Variants
- `default` - Botão padrão
- `secondary` - Estilo secundário
- `destructive` - Para ações destrutivas
- `outline` - Com borda
- `ghost` - Transparente
- `link` - Estilo de link

#### Button Sizes
- `sm` - Pequeno
- `default` - Médio
- `lg` - Grande

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento

# Build
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção

# Code Quality
npm run lint         # Executa Biome check
npm run format       # Formata código com Biome
```

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn-ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## 🔧 Troubleshooting

### Problema: "Too many connections" do Prisma

**Solução**: Certifique-se de sempre importar `db` de `@/lib/db.ts` ao invés de criar novas instâncias do PrismaClient.

### Problema: Mudanças no schema não refletem

**Solução**: Execute `npx prisma generate` após alterar o `schema.prisma`.

### Problema: Erro de tipagem do Prisma

**Solução**: 
```bash
npx prisma generate
# Reinicie o servidor TypeScript no VS Code (Ctrl+Shift+P > "TypeScript: Restart TS Server")
```

---

## 📝 Notas

- O Prisma Client é gerado em `src/generated/prisma` para melhor organização
- Todos os componentes shadcn-ui estão na pasta `src/components/ui`
- O projeto usa Biome para linting e formatação (substituto do ESLint + Prettier)

---

**Última atualização**: 13 de outubro de 2025

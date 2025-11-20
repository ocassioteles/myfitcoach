# 🎓 Guia para Desenvolvedor Iniciante

## 📚 O que Estudar Neste Projeto

Este projeto é **perfeito para iniciantes** porque combina conceitos fundamentais de desenvolvimento web moderno. Aqui está o que você deve focar:

---

## 🔧 BACKEND (Node.js + Express + Prisma)

### 1. **Estrutura de Pastas** 📁
```
src/
├── config/          # Configurações (banco de dados)
├── controllers/     # Lógica de negócio
├── routes/          # Definição de endpoints
├── models/          # (Prisma cuida disso)
└── scripts/         # Scripts utilitários
```

**Por que é importante**: Organização é fundamental em projetos reais.

### 2. **Express.js - Framework Web** 🌐

**Arquivo chave**: `src/app.js`
```javascript
const express = require('express');
const app = express();

// Middleware (processa requisições)
app.use(express.json());
app.use(cors());

// Rotas (endpoints da API)
app.use('/api/users', userRoutes);
app.use('/api/workouts', workoutRoutes);
```

**Conceitos para entender**:
- **Middleware**: Funções que processam requisições antes de chegar ao endpoint
- **Rotas**: URLs que sua API responde (`GET /api/users`, `POST /api/workouts`)
- **CORS**: Permite frontend e backend conversarem

### 3. **Controllers - Lógica de Negócio** 🧠

**Arquivo exemplo**: `src/controllers/userController.js`
```javascript
// Buscar todos os usuários
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

**Conceitos importantes**:
- **async/await**: Para operações que demoram (banco de dados)
- **try/catch**: Tratamento de erros
- **req/res**: Requisição e resposta HTTP
- **Status codes**: 200 (sucesso), 500 (erro), etc.

### 4. **Prisma ORM - Banco de Dados** 🗄️

**Arquivo chave**: `prisma/schema.prisma`
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  createdAt DateTime @default(now())
  
  // Relacionamentos
  workouts  WorkoutSession[]
}
```

**Por que Prisma é ótimo para iniciantes**:
- Escreve SQL automaticamente
- Type-safe (evita erros)
- Migrations automáticas
- Interface visual com `npx prisma studio`

### 5. **Rotas - Endpoints da API** 🛣️

**Arquivo exemplo**: `src/routes/users.js`
```javascript
const router = express.Router();

router.get('/', getUsers);        // GET /api/users
router.post('/', createUser);     // POST /api/users
router.put('/:id', updateUser);   // PUT /api/users/1
router.delete('/:id', deleteUser); // DELETE /api/users/1
```

**Conceitos HTTP**:
- **GET**: Buscar dados
- **POST**: Criar dados
- **PUT**: Atualizar dados
- **DELETE**: Remover dados

---

## 🎨 FRONTEND (Angular)

### 1. **Estrutura Angular** 📁
```
src/app/
├── components/      # Componentes reutilizáveis
├── services/        # Lógica de API
├── models/          # Tipos TypeScript
└── app.routes.ts    # Navegação
```

### 2. **Componentes - Blocos de UI** 🧩

**Arquivo exemplo**: `src/app/components/community/community.component.ts`
```typescript
@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="community-container">
      <h2>{{ title }}</h2>
      <div *ngFor="let user of users">
        {{ user.name }}
      </div>
    </div>
  `
})
export class CommunityComponent {
  title = 'Comunidade';
  users: User[] = [];
  
  ngOnInit() {
    this.loadUsers();
  }
}
```

**Conceitos Angular**:
- **@Component**: Decorator que define um componente
- **Template**: HTML do componente
- **{{ }}**: Interpolação (mostra variáveis)
- **\*ngFor**: Loop no template
- **ngOnInit**: Executa quando componente carrega

### 3. **Services - Comunicação com API** 📡

**Arquivo chave**: `src/app/services/api.service.ts`
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }
}
```

**Conceitos importantes**:
- **@Injectable**: Permite injeção de dependência
- **HttpClient**: Para fazer requisições HTTP
- **Observable**: Para dados assíncronos (RxJS)
- **Generic Types**: `<User[]>` especifica o tipo de retorno

### 4. **Roteamento - Navegação** 🧭

**Arquivo**: `src/app/app.routes.ts`
```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: DashboardComponent },
  { path: 'comunidade', component: CommunityComponent }
];
```

**Conceitos**:
- **Routes**: Define quais componentes aparecem em cada URL
- **RouterOutlet**: Onde os componentes são renderizados
- **routerLink**: Para navegação nos templates

---

## 🎯 CONCEITOS FUNDAMENTAIS PARA FOCAR

### 1. **Fluxo de Dados** 📊
```
Frontend → HTTP Request → Backend → Database → Response → Frontend
```

### 2. **Separação de Responsabilidades**
- **Frontend**: Interface do usuário
- **Backend**: Lógica de negócio e dados
- **Database**: Armazenamento persistente

### 3. **APIs RESTful**
```
GET    /api/users     → Listar usuários
POST   /api/users     → Criar usuário
PUT    /api/users/1   → Atualizar usuário 1
DELETE /api/users/1   → Deletar usuário 1
```

### 4. **Async/Await vs Promises**
```javascript
// Promise
prisma.user.findMany()
  .then(users => console.log(users))
  .catch(error => console.error(error));

// Async/Await (mais limpo)
try {
  const users = await prisma.user.findMany();
  console.log(users);
} catch (error) {
  console.error(error);
}
```

---

## 📖 ORDEM DE ESTUDO RECOMENDADA

### **Semana 1-2: Backend Básico**
1. Entenda `src/app.js` (setup do Express)
2. Veja `src/controllers/userController.js` (CRUD básico)
3. Estude `src/routes/users.js` (definição de endpoints)
4. Explore `prisma/schema.prisma` (modelos de dados)

### **Semana 3-4: Frontend Básico**
1. Entenda `app.component.ts` (componente raiz)
2. Veja `services/api.service.ts` (comunicação com backend)
3. Estude um componente simples como `dashboard/dashboard.ts`
4. Explore `app.routes.ts` (navegação)

### **Semana 5-6: Funcionalidades Avançadas**
1. Estude `controllers/communityController.js` (lógica social)
2. Veja `components/community/community.component.ts` (UI complexa)
3. Entenda relacionamentos no Prisma
4. Explore tratamento de erros

---

## 🛠️ FERRAMENTAS ESSENCIAIS

### **Para Backend**
- **Postman/Insomnia**: Testar APIs
- **Prisma Studio**: Visualizar banco de dados
- **Node.js**: Runtime JavaScript

### **Para Frontend**
- **Angular DevTools**: Debug no browser
- **Chrome DevTools**: Network tab para ver requisições
- **VS Code**: Editor com extensões Angular

---

## 🚀 PRÓXIMOS PASSOS

1. **Clone o projeto** e rode localmente
2. **Modifique pequenas coisas** (textos, cores)
3. **Adicione um campo simples** (ex: telefone do usuário)
4. **Crie um endpoint novo** (ex: buscar usuário por nome)
5. **Faça um componente simples** (ex: contador de cliques)

---

## 💡 DICAS DE OURO

### **Para Backend**
- Sempre use `try/catch` em funções async
- Valide dados antes de salvar no banco
- Use status codes HTTP corretos
- Mantenha controllers simples e focados

### **Para Frontend**
- Componentes devem ser pequenos e reutilizáveis
- Use services para lógica de negócio
- Sempre desinscreva de Observables
- Mantenha templates limpos

### **Geral**
- **Leia os erros** - eles te dizem exatamente o problema
- **Use console.log()** para debugar
- **Faça mudanças pequenas** e teste sempre
- **Não tenha medo de quebrar** - é assim que se aprende!

---

## 🎉 CONCLUSÃO

Este projeto tem **tudo que um dev iniciante precisa aprender**:
- APIs REST
- Banco de dados
- Frontend moderno
- Autenticação (próximo passo)
- Deploy (próximo passo)

**Comece pequeno, seja consistente, e em 2-3 meses você estará confortável com desenvolvimento full-stack!** 🚀

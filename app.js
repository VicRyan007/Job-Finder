const express    = require("express");
const app        = express();
const db         = require("./db/connection");
const bodyParser = require("body-parser");
const { engine } = require("express-handlebars");
const path       = require("path");
const Job        = require("./models/Job");
const { Op, fn, col, where } = require("sequelize");

const PORT = 3300;

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// Configurações do Handlebars
app.set("views", path.join(__dirname, "views"));
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Conexão com o banco de dados
db.authenticate()
  .then(() => console.log("Conectado com sucesso"))
  .catch(err => console.error("Erro ao conectar:", err));

// Rota principal com busca (insensível a maiúsculas/minúsculas)
app.get("/", (req, res) => {
  const search = (req.query.job || "").trim();

  // Opções padrão de busca
  const findOptions = {
    order: [["createdAt", "DESC"]]
  };

  if (search) {
    // Busca case-insensitive no campo title
    findOptions.where = where(
      fn("LOWER", col("title")),
      { [Op.like]: `%${search.toLowerCase()}%` }
    );
  }

  Job.findAll(findOptions)
    .then(jobs => res.render("index", { jobs, search }))
    .catch(err => {
      console.error("Erro ao buscar jobs:", err);
      res.status(500).send("Erro no servidor");
    });
});

// Rotas de jobs (add, etc.)
app.use("/jobs", require("./routes/jobs"));

// Inicializa o servidor
app.listen(PORT, () => 
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);

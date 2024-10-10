const apiKey = '4GeEQXy0ttFKtsEC9NbVGmSpc66VLa84';
const matricula = '426323';

// URLs para as APIs
const topStoriesUrl = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${apiKey}`;
const mostPopularUrl = `https://api.nytimes.com/svc/mostpopular/v2/viewed/7.json?api-key=${apiKey}`;

// Configurações de paginação
const articlesPerPage = 6;
let page = 0;

// Função para buscar artigos principais
async function fetchTopStories() {
  try {
    const response = await fetch(topStoriesUrl);
    const data = await response.json();
    displayFeaturedArticle(data.results[0]);  // Matéria principal
    displayArticles(data.results.slice(1));   // Outras matérias
    await logApiUsage('NYT', 'fetchTopStories', 'Sucesso');
  } catch (error) {
    console.error('Error fetching top stories:', error);
    await logApiUsage('NYT', 'fetchTopStories', 'Erro');
  }
}

// Exibir o artigo em destaque
function displayFeaturedArticle(article) {
  const featuredArticle = document.getElementById('featured-article');
  featuredArticle.innerHTML = 
    `<h3>${article.title}</h3>
     <p>${article.abstract}</p>
     <a href="${article.url}" target="_blank">Read more</a>`;
}

// Exibir lista de artigos
function displayArticles(articles) {
  const articleContainer = document.getElementById('articles');
  const start = page * articlesPerPage;
  const end = start + articlesPerPage;
  const articlesToShow = articles.slice(start, end);

  articlesToShow.forEach((article) => {
    const articleEl = document.createElement('article');
    articleEl.innerHTML = 
      `<h3>${article.title}</h3>
       <p>${article.abstract}</p>
       <a href="${article.url}" target="_blank">Read more</a>`;
    articleContainer.appendChild(articleEl);
  });

  page++;
}

// Evento para carregar mais artigos
document.getElementById('load-more').addEventListener('click', fetchTopStories);

// Função para buscar artigos populares
async function fetchMostPopular() {
  try {
    const response = await fetch(mostPopularUrl);
    const data = await response.json();
    displayPopularArticles(data.results);
    await logApiUsage('NYT', 'fetchMostPopular', 'Sucesso');
  } catch (error) {
    console.error('Error fetching most popular articles:', error);
  }
}

// Exibir artigos populares
function displayPopularArticles(articles) {
  const popularArticles = document.getElementById('popular-articles');
  popularArticles.innerHTML = ''; // Limpa o conteúdo existente, se houver

  articles.forEach((article) => {
    const articleEl = document.createElement('article');
    articleEl.innerHTML = 
      `<h3>${article.title}</h3>
       <p>${article.abstract}</p>
       <a href="${article.url}" target="_blank">Read more</a>`;
    popularArticles.appendChild(articleEl);
  });
}

// Função para registrar logs de uso de API
async function logApiUsage(api, method, result) {
  const url = `https://www.piway.com.br/unoesc/api/inserir/log/${matricula}/${api}/${method}/${result}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Resposta do logApiUsage:', data);
    console.log(data.message || 'Resposta não contém a propriedade "message".');
  } catch (error) {
    console.error('Error logging API usage:', error);
  }
}

// Função para buscar logs registrados
async function fetchLogs() {
  const url = `https://www.piway.com.br/unoesc/api/logs/${matricula}`;
  try {
    const response = await fetch(url);
    const logs = await response.json();
    displayLogs(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
  }
}

// Exibir logs registrados
function displayLogs(logs) {
  const logsList = document.getElementById('logs-list');
  logsList.innerHTML = '';

  if (!Array.isArray(logs)) {
    logsList.innerHTML = '<li>Erro ao carregar logs.</li>';
    return;
  }

  logs.forEach(log => {
    const logItem = document.createElement('li');
    logItem.innerHTML = `Log: ${log.resultado} <button onclick="deleteLog(${log.id})">Excluir</button>`;
    logsList.appendChild(logItem);
  });
}

// Função para excluir um log específico
async function deleteLog(logId) {
  const url = `https://www.piway.com.br/unoesc/api/excluir/log/${logId}/aluno/${matricula}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log('Resposta da API de exclusão:', data);

    if (data && typeof data === 'object') {
      if (data.message && data.message.includes("excluído")) {
        console.log(`Log ${logId} excluído com sucesso.`);
      } else {
        console.log(`Falha ao excluir o log ${logId}: ${data.message || 'Mensagem não fornecida'}`);
      }
    } else {
      console.error('Resposta inesperada da API:', data);
    }

    fetchLogs(); // Atualiza a lista de logs após a exclusão
  } catch (error) {
    console.error(`Erro ao excluir o log ${logId}:`, error);
  }
}

// Modal de exibição de logs
const logsButton = document.getElementById('show-logs');
const logsModal = document.getElementById('logs-modal');
const closeModal = document.querySelector('.close');

logsButton.addEventListener('click', () => {
  logsModal.style.display = 'block';
  fetchLogs();
});

closeModal.addEventListener('click', () => {
  logsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
  if (event.target === logsModal) {
    logsModal.style.display = 'none';
  }
});

// Inicializar chamadas para as APIs
fetchTopStories();
fetchMostPopular();

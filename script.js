// Variável global para controlar o painel
let adminPanelVisible = false;

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7CNhqzkYggagv3fUB5_QaKut2F-tzpiY",
    authDomain: "bigshot-cb838.firebaseapp.com",
    projectId: "bigshot-cb838",
    storageBucket: "bigshot-cb838.firebasestorage.app",
    messagingSenderId: "1029508559269",
    appId: "1:1029508559269:web:9439ed20d9adf46eda784c",
    measurementId: "G-0S7X2F9HL0"
  };

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Função simplificada para abrir o painel
function openAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        console.error('Painel admin não encontrado!');
        return;
    }
    
    adminPanel.style.display = 'block';
    console.log('Tentando abrir o painel admin');
    mostrarFichasSalvas();
}

// Função simplificada para fechar o painel
function closeAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        console.error('Painel admin não encontrado!');
        return;
    }
    
    adminPanel.style.display = 'none';
    console.log('Fechando painel admin');
}

// Listener para F2
document.addEventListener('keydown', function(e) {
    console.log('Tecla pressionada:', e.key);
    
    if (e.key === 'F2') {
        e.preventDefault();
        const senha = prompt('Digite a senha de administrador:');
        
        if (senha === 'BIGSHOT@2016') {
            openAdminPanel();
        } else {
            alert('Senha incorreta!');
        }
    }
});

// Função para calcular vida
function calcularVida(forca, determinacao) {
    return 10 + forca + determinacao;
}

// Função para atualizar vida
function atualizarVida() {
    const forca = parseInt(document.getElementById('forca').value) || 0;
    const determinacao = parseInt(document.getElementById('determinacao').value) || 0;
    document.getElementById('vidaTotal').textContent = calcularVida(forca, determinacao);
}

// Array para armazenar fichas
let fichas = [];

// Função para validar pontos
function validarPontos() {
    const inteligencia = parseInt(document.getElementById('inteligencia').value) || 0;
    const forca = parseInt(document.getElementById('forca').value) || 0;
    const agilidade = parseInt(document.getElementById('agilidade').value) || 0;
    const determinacao = parseInt(document.getElementById('determinacao').value) || 0;

    const totalPontos = inteligencia + forca + agilidade + determinacao;
    const pontosRestantes = 5 - totalPontos;
    
    document.getElementById('pontosRestantes').textContent = pontosRestantes;
    
    return pontosRestantes >= 0;
}

// Adicione os listeners para os inputs de atributos
document.querySelectorAll('.atributo input').forEach(input => {
    input.addEventListener('input', function() {
        if (parseInt(this.value) < 0) this.value = 0;
        if (parseInt(this.value) > 5) this.value = 5;
        validarPontos();
    });
});

// Função para salvar ficha
function salvarFicha(ficha) {
    return database.ref('fichas').push(ficha)
        .then(() => {
            alert('Ficha salva com sucesso!');
        })
        .catch((error) => {
            console.error("Erro ao salvar ficha:", error);
            alert('Erro ao salvar ficha!');
        });
}

// Função para carregar fichas
function carregarFichas() {
    const fichasSalvas = document.getElementById('fichasSalvas');
    fichasSalvas.innerHTML = '<h3>Carregando fichas...</h3>';

    database.ref('fichas').on('value', (snapshot) => {
        fichasSalvas.innerHTML = '';
        
        if (!snapshot.exists()) {
            fichasSalvas.innerHTML = '<p>Nenhuma ficha encontrada.</p>';
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const ficha = childSnapshot.val();
            const fichaKey = childSnapshot.key;
            
            const fichaElement = document.createElement('div');
            fichaElement.classList.add('ficha-salva');
            fichaElement.innerHTML = `
                <h3>Ficha - ${ficha.nome}</h3>
                <p>Idade: ${ficha.idade}</p>
                <p>Trabalho: ${ficha.trabalho}</p>
                <p>Descrição: ${ficha.descricao}</p>
                <p>Inteligência: ${ficha.inteligencia}</p>
                <p>Força: ${ficha.forca}</p>
                <p>Agilidade: ${ficha.agilidade}</p>
                <p>Determinação: ${ficha.determinacao}</p>
                <p>Vida Total: ${ficha.vida}</p>
                <button onclick="deletarFicha('${fichaKey}')" class="delete-btn">Deletar</button>
                <hr>
            `;
            fichasSalvas.appendChild(fichaElement);
        });
    });
}

// Função para deletar ficha
function deletarFicha(fichaKey) {
    if (confirm('Tem certeza que deseja deletar esta ficha?')) {
        database.ref('fichas').child(fichaKey).remove()
            .then(() => {
                alert('Ficha deletada com sucesso!');
            })
            .catch((error) => {
                console.error("Erro ao deletar ficha:", error);
                alert('Erro ao deletar ficha!');
            });
    }
}

// Atualizar o evento de submit do formulário
document.getElementById('fichaForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    if (!validarPontos()) {
        alert('Você deve distribuir exatamente 5 pontos entre os atributos!');
        return;
    }

    const ficha = {
        nome: document.getElementById('nome').value,
        idade: document.getElementById('idade').value,
        trabalho: document.getElementById('trabalho').value,
        descricao: document.getElementById('descricao').value,
        inteligencia: parseInt(document.getElementById('inteligencia').value),
        forca: parseInt(document.getElementById('forca').value),
        agilidade: parseInt(document.getElementById('agilidade').value),
        determinacao: parseInt(document.getElementById('determinacao').value),
        vida: calcularVida(
            parseInt(document.getElementById('forca').value),
            parseInt(document.getElementById('determinacao').value)
        ),
        dataCriacao: firebase.database.ServerValue.TIMESTAMP
    };

    await salvarFicha(ficha);
    this.reset();
    atualizarVida();
});

// Quando a página carregar
window.onload = function() {
    // Adicionar botão de fechar
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        const closeButton = document.createElement('button');
        closeButton.innerHTML = 'X';
        closeButton.className = 'close-button';
        closeButton.onclick = closeAdminPanel;
        adminPanel.insertBefore(closeButton, adminPanel.firstChild);
    }
    
    // Carregar fichas do localStorage
    const fichasSalvas = localStorage.getItem('fichasRPG');
    if (fichasSalvas) {
        fichas = JSON.parse(fichasSalvas);
    }
    
    validarPontos();
} 
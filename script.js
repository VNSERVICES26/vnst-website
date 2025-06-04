// Mobile menu toggle
const menuToggle = document.createElement('div');
menuToggle.className = 'menu-toggle';
menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
const header = document.querySelector('header .container');
if(header) {
    header.prepend(menuToggle);
}

const nav = document.querySelector('nav');
if(nav) {
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        menuToggle.querySelector('i').classList.toggle('fa-times');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function() {
        if(nav.classList.contains('active')) {
            nav.classList.remove('active');
            menuToggle.querySelector('i').classList.remove('fa-times');
        }
    });
});

// Image animations
function animateImages() {
    const images = document.querySelectorAll('.animated-image');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'all 0.8s ease-out';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(img);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    animateImages();
    
    // Buy VNST Modal
    const modal = document.getElementById("buyVNSTModal");
    const btn = document.getElementById("buyVNSTBtn");
    const span = document.getElementsByClassName("close")[0];

    btn.onclick = function() {
        modal.style.display = "block";
        initSwapWidget();
    }

    span.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});

// Swap Widget Functionality
const CONFIG = {
    mainnet: {
        vnstSwapAddress: "0x8FD96c769308bCf01A1F5E9f93805c552fF80713", 
        vnstTokenAddress: "0xF9Bbb00436B384b57A52D1DfeA8Ca43fC7F11527", 
        usdtTokenAddress: "0x55d398326f99059fF775485246999027B3197955", 
        chainId: "0x38", // BSC Mainnet chain ID
        rpcUrl: "https://bsc-dataseed.binance.org/"
    }
};

let web3;
let swapContract;
let vnstToken;
let usdtToken;
let currentAccount = null;
let minBuyAmount = 0;
let vnstDecimals = 18;

async function initSwapWidget() {
    try {
        const config = CONFIG.mainnet;
        web3 = new Web3(window.ethereum || config.rpcUrl);
        
        const swapABI = [/* Your full swap ABI here */];
        const tokenABI = [/* Your full token ABI here */];

        swapContract = new web3.eth.Contract(swapABI, config.vnstSwapAddress);
        vnstToken = new web3.eth.Contract(tokenABI, config.vnstTokenAddress);
        usdtToken = new web3.eth.Contract(tokenABI, config.usdtTokenAddress);
        
        minBuyAmount = await swapContract.methods.minBuy().call();
        vnstDecimals = await vnstToken.methods.decimals().call();
        
        document.getElementById('minBuyAmount').textContent = formatUnits(minBuyAmount, vnstDecimals) + ' VNST';
        
        await loadContractData();
        setupEventListeners();
    } catch (error) {
        showMessage(`Error initializing swap widget: ${error.message}`, 'error');
    }
}

async function loadContractData() {
    try {
        const price = await swapContract.methods.getPricePerVNST().call();
        document.getElementById('vnstPrice').textContent = `${formatUnits(price, 18)} USDT`;
        
        const sellerWallet = await swapContract.methods.sellerWallet().call();
        const availableVNST = await vnstToken.methods.balanceOf(sellerWallet).call();
        document.getElementById('availableVNST').textContent = `${formatUnits(availableVNST, vnstDecimals)} VNST`;
        
        document.getElementById('vnstContract').textContent = await swapContract.methods.vnstToken().call();
    } catch (error) {
        showMessage(`Error loading contract data: ${error.message}`, 'error');
    }
}

function setupEventListeners() {
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
    document.getElementById('approveBtn').addEventListener('click', approveUSDT);
    document.getElementById('buyBtn').addEventListener('click', buyVNST);
    document.getElementById('copyContractBtn').addEventListener('click', copyContractAddress);
    document.getElementById('vnstAmount').addEventListener('input', calculateQuote);
}

// Include all your existing swap widget functions here (connectWallet, approveUSDT, buyVNST, etc.)
// Make sure to update all DOM selectors to work within the modal

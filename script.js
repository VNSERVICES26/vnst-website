// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');

if (menuToggle && nav) {
    menuToggle.addEventListener('click', function() {
        nav.classList.toggle('active');
        this.querySelector('i').classList.toggle('fa-times');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                menuToggle.querySelector('i').classList.remove('fa-times');
            }
        });
    });
}

// Image Animations
function animateImages() {
    const images = document.querySelectorAll('.animated-image');
    
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transform = 'translateY(20px)';
        img.style.transition = 'all 0.8s ease-out';
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(img);
    });
}

// Swap Widget Configuration
const CONFIG = {
    mainnet: {
        vnstSwapAddress: "0x8FD96c769308bCf01A1F5E9f93805c552fF80713",
        vnstTokenAddress: "0xF9Bbb00436B384b57A52D1DfeA8Ca43fC7F11527",
        usdtTokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        chainId: "0x38", // BSC Mainnet
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

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    animateImages();
    
    // Buy VNST Modal
    const modal = document.getElementById("buyVNSTModal");
    const btn = document.getElementById("buyVNSTBtn");
    const span = document.getElementsByClassName("close")[0];

    if (btn && modal && span) {
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
    }
});

// Initialize Swap Widget
async function initSwapWidget() {
    try {
        const config = CONFIG.mainnet;
        web3 = new Web3(window.ethereum || config.rpcUrl);
        
        // ABI definitions should be added here
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
        
        // Check if wallet is already connected
        await checkWalletConnection();
    } catch (error) {
        showMessage(`Error initializing swap widget: ${error.message}`, 'error');
    }
}

// Load Contract Data
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

// Setup Event Listeners
function setupEventListeners() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const approveBtn = document.getElementById('approveBtn');
    const buyBtn = document.getElementById('buyBtn');
    const copyBtn = document.getElementById('copyContractBtn');
    const vnstAmountInput = document.getElementById('vnstAmount');

    if (connectBtn) connectBtn.addEventListener('click', connectWallet);
    if (approveBtn) approveBtn.addEventListener('click', approveUSDT);
    if (buyBtn) buyBtn.addEventListener('click', buyVNST);
    if (copyBtn) copyBtn.addEventListener('click', copyContractAddress);
    if (vnstAmountInput) vnstAmountInput.addEventListener('input', calculateQuote);
}

// Check Wallet Connection
async function checkWalletConnection() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                currentAccount = accounts[0];
                updateWalletInfo();
                setupWalletEvents();
            }
        } catch (error) {
            console.error("Error checking wallet connection:", error);
        }
    }
}

// Connect Wallet
async function connectWallet() {
    if (!window.ethereum) {
        showMessage('Please install MetaMask or another Web3 wallet', 'error');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        setupWalletEvents();
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== CONFIG.mainnet.chainId) {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CONFIG.mainnet.chainId }],
                });
            } catch (switchError) {
                showMessage('Please switch to Binance Smart Chain', 'error');
                return;
            }
        }
        
        updateWalletInfo();
        showMessage('Wallet connected successfully', 'success');
    } catch (error) {
        if (error.code === 4001) {
            showMessage('User rejected connection request', 'error');
        } else {
            showMessage(`Error connecting wallet: ${error.message}`, 'error');
        }
    }
}

// Update Wallet Info
async function updateWalletInfo() {
    if (!currentAccount) return;
    
    try {
        const usdtDecimals = await usdtToken.methods.decimals().call();
        const balance = await usdtToken.methods.balanceOf(currentAccount).call();
        
        document.getElementById('walletAddress').textContent = shortenAddress(currentAccount);
        document.getElementById('usdtBalance').textContent = formatUnits(balance, usdtDecimals);
        document.getElementById('walletInfo').classList.remove('hidden');
        
        document.getElementById('connectWalletBtn').textContent = 'Connected';
    } catch (error) {
        console.error('Error updating wallet info:', error);
    }
}

// Setup Wallet Events
function setupWalletEvents() {
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            currentAccount = accounts.length > 0 ? accounts[0] : null;
            updateWalletInfo();
        });
        
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });

        // Handle disconnection
        window.ethereum.on('disconnect', (error) => {
            console.log('Wallet disconnected:', error);
            currentAccount = null;
            updateWalletInfo();
        });
    }
}

// Calculate Quote
async function calculateQuote() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            document.getElementById('quoteResult').classList.add('hidden');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        const minBuy = web3.utils.toBN(minBuyAmount);
        
        if (vnstAmount.lt(minBuy)) {
            document.getElementById('quoteResult').classList.add('hidden');
            return;
        }
        
        const usdtAmount = await swapContract.methods.getQuote(vnstAmount.toString()).call();
        const usdtDecimals = await usdtToken.methods.decimals().call();
        
        document.getElementById('usdtAmount').textContent = formatUnits(usdtAmount, usdtDecimals);
        document.getElementById('quoteResult').classList.remove('hidden');
        
        const isApproved = await checkApprovalStatus(vnstAmount.toString());
        document.getElementById('approveBtn').disabled = isApproved;
        document.getElementById('buyBtn').disabled = !isApproved;
        
    } catch (error) {
        console.error('Quote calculation error:', error);
        document.getElementById('quoteResult').classList.add('hidden');
    }
}

// Check Approval Status
async function checkApprovalStatus(vnstAmount) {
    try {
        if (!vnstAmount || web3.utils.toBN(vnstAmount).lt(web3.utils.toBN(minBuyAmount))) {
            return false;
        }
        
        const requiredAllowance = await swapContract.methods.getQuote(vnstAmount).call();
        const currentAllowance = await usdtToken.methods.allowance(
            currentAccount, 
            CONFIG.mainnet.vnstSwapAddress
        ).call();
        
        return web3.utils.toBN(currentAllowance).gte(web3.utils.toBN(requiredAllowance));
    } catch (error) {
        console.error('Approval check error:', error);
        return false;
    }
}

// Approve USDT
async function approveUSDT() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            showMessage('Please enter a valid VNST amount', 'error');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        
        if (vnstAmount.lt(web3.utils.toBN(minBuyAmount))) {
            showMessage(`Minimum purchase is ${formatUnits(minBuyAmount, vnstDecimals)} VNST`, 'error');
            return;
        }
        
        const requiredAllowance = await swapContract.methods.getQuote(vnstAmount.toString()).call();
        
        await handleTransaction(
            usdtToken.methods.approve(
                CONFIG.mainnet.vnstSwapAddress,
                requiredAllowance
            ).send({ from: currentAccount }),
            'USDT approved successfully!'
        );
        
        document.getElementById('approveBtn').disabled = true;
        document.getElementById('buyBtn').disabled = false;
    } catch (error) {
        if (error.code === 4001) {
            showMessage('User rejected transaction', 'error');
        } else {
            showMessage(`Approval failed: ${error.message}`, 'error');
        }
    }
}

// Buy VNST
async function buyVNST() {
    try {
        const vnstAmountInput = document.getElementById('vnstAmount').value;
        if (!vnstAmountInput || isNaN(vnstAmountInput)) {
            showMessage('Please enter a valid VNST amount', 'error');
            return;
        }
        
        const vnstAmount = toTokenUnits(vnstAmountInput);
        
        if (vnstAmount.lt(web3.utils.toBN(minBuyAmount))) {
            showMessage(`Minimum purchase is ${formatUnits(minBuyAmount, vnstDecimals)} VNST`, 'error');
            return;
        }
        
        await handleTransaction(
            swapContract.methods.buyVNST(vnstAmount.toString()).send({ from: currentAccount }),
            'VNST purchased successfully!'
        );
        
        await loadContractData();
    } catch (error) {
        if (error.code === 4001) {
            showMessage('User rejected transaction', 'error');
        } else {
            showMessage(`Purchase failed: ${error.message}`, 'error');
        }
    }
}

// Handle Transaction
async function handleTransaction(transactionPromise, successMessage) {
    try {
        showMessage('Processing transaction...', 'status');
        await transactionPromise;
        showMessage(successMessage, 'success');
    } catch (error) {
        throw error;
    }
}

// Copy Contract Address
function copyContractAddress() {
    const address = document.getElementById('vnstContract').textContent;
    navigator.clipboard.writeText(address);
    showMessage('Contract address copied!', 'success');
}

// Helper Functions
function toTokenUnits(amount, decimals = 18) {
    return web3.utils.toBN(amount).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));
}

function formatUnits(value, decimals) {
    return (value / 10 ** decimals).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
    });
}

function shortenAddress(address) {
    return address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : '';
}

function showMessage(message, type = 'status') {
    const statusDiv = document.getElementById('statusMessages');
    if (!statusDiv) return;
    
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.classList.add(`${type}-message`);
    statusDiv.appendChild(messageElement);
    
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

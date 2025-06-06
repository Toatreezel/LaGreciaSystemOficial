import React, { useState, useEffect, useCallback } from 'react';

// --- ÍCONES (Placeholders) ---
const PizzaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 11h.01"/><path d="M11 15h.01"/><path d="M16 16h.01"/><path d="m2 16 2.24 1.26a4 4 0 0 0 4.02-1.26l1.48-1.48a4 4 0 0 1 5.66 0l1.48 1.48a4 4 0 0 0 4.02 1.26L22 16"/><path d="M5.47 12.53a4 4 0 0 1 0-5.66l1.48-1.48a4 4 0 0 1 5.66 0l1.48 1.48a4 4 0 0 1 0 5.66l-1.48 1.48a4 4 0 0 1-5.66 0Z"/></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>;
const ChevronDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
const ChevronUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const IFoodIcon = () => <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20Z" fill="#ea1d2c" stroke="#ea1d2c" strokeWidth="4"/><path d="M30.33 13.336H18.014v3.35h7.245v3.313h-7.245v3.35h7.525v3.313h-7.525v6.012h-4.008V13.336h-2v19.338h20.324v-3.313h-7.526v-3.35h7.526v-3.313h-7.245v-3.35h7.245v-2.662Z" fill="#fff"/></svg>;
const AnotaAiIcon = () => <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4 4 12.954 4 24s8.954 20 20 20Z" fill="#4B89DA" stroke="#4B89DA" strokeWidth="4"/><path d="M24 30a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z" fill="#fff" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M34 24a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

// --- CONFIGURAÇÕES ---
const PIZZA_DB_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTfCzOXaEqt_r53BtkoAsVKc0CKWP3HaahWi1GPI4k9Ubz14E3exXrdTkTQ68jtiv9lj3QtkmsRlD3E/pub?output=tsv';
// IMPORTANTE: Substitua pela URL do seu projeto Glitch
const WEBHOOK_SERVER_URL = 'https://seu-projeto.glitch.me'; // Ex: 'https://nome-aleatorio.glitch.me'

const FINALIZATION_INGREDIENTS = ['tomate cofitado', 'manjericão', 'rúcula', 'm&ms', 'coco ralado', 'rapadura', 'chocolate', 'doce de leite', 'paçoca', 'leite condensado'];

// --- COMPONENTES ---
const ProgressBar = ({ estimatedSendTime, isRetomado }) => {
    const [remainingMinutes, setRemainingMinutes] = useState(0);
    const [barClass, setBarClass] = useState('');
    useEffect(() => {
        const calculateTime = () => {
            const now = new Date();
            const diff = new Date(estimatedSendTime).getTime() - now.getTime();
            const minutes = Math.ceil(diff / (1000 * 60));
            setRemainingMinutes(minutes > 0 ? minutes : 0);
            if (isRetomado) setBarClass('bg-pink-400 animate-pulse');
            else if (minutes <= 10) setBarClass('bg-red-500 animate-pulse');
            else if (minutes <= 15) setBarClass('bg-yellow-400');
            else setBarClass('bg-green-500');
        };
        calculateTime();
        const interval = setInterval(calculateTime, 15000); 
        return () => clearInterval(interval);
    }, [estimatedSendTime, isRetomado]);
    const progressPercentage = isRetomado ? (remainingMinutes / 5) * 100 : (remainingMinutes / 30) * 100;
    return <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden"><div className={`h-4 rounded-full transition-all duration-500 ${barClass}`} style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}></div><span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black mix-blend-screen">{remainingMinutes > 0 ? `${remainingMinutes} min` : 'Atrasado'}</span></div>;
};

const PedidoCard = ({ pedido, onFinalizar, onRetomar, pizzaDetails, isHistory }) => {
    const formatIngredients = (allIngredients) => {
        if (!allIngredients) return [];
        const core = [], finalization = [], base = [];
        allIngredients.forEach(ing => {
            const lowerIng = ing.toLowerCase();
            if (FINALIZATION_INGREDIENTS.includes(lowerIng)) finalization.push(ing);
            else if (lowerIng.includes('massa')) base.push(ing);
            else if (lowerIng.includes('molho')) base.push(ing);
            else if (lowerIng.includes('queijo') || lowerIng.includes('mozzarella') || lowerIng.includes('mussarela')) base.push(ing);
            else core.push(ing);
        });
        const sortedBase = base.sort((a, b) => (a.toLowerCase().includes('massa') ? -1 : b.toLowerCase().includes('massa') ? 1 : a.toLowerCase().includes('molho') ? -1 : b.toLowerCase().includes('molho') ? 1 : 0));
        return [...sortedBase, ...core, ...finalization];
    };
    const ingredients = pizzaDetails ? formatIngredients(pizzaDetails.ingredients) : [];
    return <div className="bg-white rounded-xl shadow-lg flex flex-col relative p-4 pt-16 border-2 border-transparent hover:border-blue-300 transition-all duration-300"><div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-md"><img src={pizzaDetails?.imageUrl || pedido.image} alt={pedido.pizzaName} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x300/296a9a/white?text=LaGRÉCIA`; }}/></div><div className="text-center text-xs font-semibold mb-2">{pedido.isRetomado ? 'RETOMADO' : `Enviar em: ${new Date(pedido.estimatedSendTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}</div><ProgressBar estimatedSendTime={pedido.estimatedSendTime} isRetomado={pedido.isRetomado} /><div className="flex-grow mt-4 text-center"><h3 className="font-bold text-lg text-gray-800">{pedido.pizzaName}</h3><p className="text-xs text-gray-500 mb-1">{pedido.isHalf ? 'Meia Pizza' : 'Pizza Inteira'}</p><p className="text-lg font-semibold text-[#296a9a] mb-2">R$ {pedido.price.toFixed(2).replace('.', ',')}</p><div className="text-left text-xs text-gray-600 my-2 max-h-20 overflow-y-auto pr-2"><p className="font-bold text-xs mb-1">Ingredientes:</p>{ingredients.length > 0 ? (<ol className="list-decimal list-inside">{ingredients.map((ing, i) => <li key={i}>{ing}</li>)}</ol>) : (<p>Carregando...</p>)}</div>{pedido.observation && (<div className="mt-2 text-left text-xs bg-yellow-100 p-2 rounded"><p className="font-bold">OBS:</p><p>{pedido.observation}</p></div>)}</div><div className="flex justify-between items-center mt-4 pt-2 border-t"><div className="flex items-center gap-1">{pedido.platform === 'ifood' ? <IFoodIcon /> : <AnotaAiIcon />}<span className="text-xs text-gray-400">#{pedido.displayId}</span></div>{isHistory ? (<button onClick={() => onRetomar(pedido)} className="bg-pink-500 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-pink-600 transition-colors">Retomar</button>) : (<button onClick={() => onFinalizar(pedido)} className="bg-[#296a9a] text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-[#205074] transition-colors">Finalizar</button>)}</div></div>;
};

const HistorySidebar = ({ history, isVisible }) => (isVisible && <div className="bg-gray-50 p-3 rounded-lg shadow-inner h-full overflow-y-auto"><h3 className="text-sm font-bold mb-2 text-gray-600">IDs Histórico</h3><ul className="space-y-1">{[...history].reverse().map(p => <li key={p.id} className="text-xs text-gray-500 bg-white p-1 rounded text-center">#{p.displayId}</li>)}</ul></div>);
const MenuCard = ({ pizza, onAdd }) => <div className="bg-white rounded-xl shadow-lg flex flex-col relative p-4 pt-16 border-2 border-transparent hover:border-blue-300 transition-all duration-300 items-center"><div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-md"><img src={pizza.imageUrl} alt={pizza.name} className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src=`https://placehold.co/400x300/296a9a/white?text=${pizza.name.replace(' ', '+')}`; }} /></div><h3 className="font-bold text-lg text-gray-800 mt-4 text-center">{pizza.name}</h3><p className="text-xs text-gray-600 text-center flex-grow my-2 px-2">{pizza.ingredients.join(', ')}</p><button onClick={() => onAdd(pizza)} className="mt-auto bg-green-500 text-white text-xs font-bold py-1 px-4 rounded-full hover:bg-green-600 transition-colors">Adicionar</button></div>;

// --- LÓGICA DE NORMALIZAÇÃO DE DADOS ---
const normalizeAnotaAiOrder = (apiResponse) => {
    const { info } = apiResponse;
    if (!info) return null;
    let mainItem = info.items.find(item => !item.name.toLowerCase().includes('refrigerante') && !item.name.toLowerCase().includes('suco')) || info.items[0];
    if (!mainItem) return null;
    return { id: info._id, displayId: info.shortReference, platform: 'anotaai', pizzaName: mainItem.name, isHalf: mainItem.name.toLowerCase().includes('meia'), price: info.total, estimatedSendTime: info.time_max, observation: info.observation, isRetomado: false };
};
const normalizeIFoodOrder = (apiResponse) => {
    const { order } = apiResponse;
    if (!order) return null;
    let mainItem = order.items.find(item => item.name.toLowerCase().includes('pizza')) || order.items[0];
    if (!mainItem) return null;
    const estimatedSendTime = new Date(new Date(order.createdAt).getTime() + 30 * 60 * 1000).toISOString();
    return { id: order.id, displayId: order.displayId, platform: 'ifood', pizzaName: mainItem.name, isHalf: mainItem.name.toLowerCase().includes('meia'), price: order.payment.totalPrice, estimatedSendTime, observation: order.extraInfo, isRetomado: false };
};
const processIncomingOrder = (apiResponse) => {
    if (apiResponse.order?.salesChannel === 'IFOOD') return normalizeIFoodOrder(apiResponse);
    if (apiResponse.info?.salesChannel === 'anotaai') return normalizeAnotaAiOrder(apiResponse);
    console.warn("Formato de pedido desconhecido:", apiResponse);
    return null;
}

// --- COMPONENTE PRINCIPAL App ---
export default function App() {
    const [activeTab, setActiveTab] = useState('pedidos');
    const [pedidos, setPedidos] = useState([]);
    const [historico, setHistorico] = useState([]);
    const [menu, setMenu] = useState([]);
    const [showHistorySidebar, setShowHistorySidebar] = useState(true);

    const fetchMenu = useCallback(async () => {
        try {
            const response = await fetch(PIZZA_DB_URL);
            const tsvText = await response.text();
            const rows = tsvText.split('\n').slice(1);
            const pizzaMenu = rows.map(row => {
                const [name, ingredients, imageUrl] = row.split('\t');
                return { name, ingredients: ingredients ? ingredients.split(',').map(i => i.trim()) : [], imageUrl };
            });
            setMenu(pizzaMenu);
        } catch (error) { console.error("Falha ao buscar o menu:", error); }
    }, []);

    useEffect(() => {
        fetchMenu();
        // Conexão em tempo real com o servidor de Webhook
        console.log("Tentando conectar ao servidor de eventos:", `${WEBHOOK_SERVER_URL}/events`);
        const eventSource = new EventSource(`${WEBHOOK_SERVER_URL}/events`);
        
        eventSource.onopen = () => {
            console.log("Conexão com o servidor de pedidos estabelecida.");
        };
        
        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.message) { // Ignora mensagens de status
                console.log("Mensagem do servidor:", data.message);
                return;
            }
            
            console.log("Novo pedido recebido via webhook:", data);
            const pedidoNormalizado = processIncomingOrder(data);
            if (pedidoNormalizado) {
                setPedidos(prev => [...prev, pedidoNormalizado].sort((a, b) => new Date(a.estimatedSendTime) - new Date(b.estimatedSendTime)));
            }
        };

        eventSource.onerror = (err) => {
            console.error("Erro na conexão com o servidor de eventos:", err);
            eventSource.close();
        };

        // Reordena a lista periodicamente
        const interval = setInterval(() => setPedidos(prev => [...prev].sort((a, b) => new Date(a.estimatedSendTime) - new Date(b.estimatedSendTime))), 10000);
        
        return () => {
            clearInterval(interval);
            eventSource.close();
        };
    }, [fetchMenu]);

    const getPizzaDetails = (pizzaName) => menu.find(p => p.name.toLowerCase() === pizzaName.toLowerCase());
    const handleFinalizarPedido = (pedido) => { setPedidos(prev => prev.filter(p => p.id !== pedido.id)); setHistorico(prev => [pedido, ...prev]); };
    const handleRetomarPedido = (pedido) => { setHistorico(prev => prev.filter(p => p.id !== pedido.id)); const retomado = { ...pedido, estimatedSendTime: new Date(Date.now() + 5 * 60 * 1000), isRetomado: true, id: `retomado-${pedido.displayId}-${Date.now()}` }; setPedidos(prev => [...prev, retomado].sort((a, b) => new Date(a.estimatedSendTime) - new Date(b.estimatedSendTime))); setActiveTab('pedidos'); };
    const handleAddFromMenu = (pizza) => { const newPedido = { id: `manual-${Date.now()}`, displayId: Math.floor(1000 + Math.random() * 9000), platform: 'anotaai', pizzaName: pizza.name, isHalf: false, price: 65.00, estimatedSendTime: new Date(Date.now() + 10 * 60 * 1000), observation: 'Adicionado pelo menu.', isRetomado: true, image: pizza.imageUrl }; setPedidos(prev => [...prev, newPedido].sort((a,b) => new Date(a.estimatedSendTime) - new Date(b.estimatedSendTime))); setActiveTab('pedidos'); }

    const renderContent = () => {
        switch (activeTab) {
            case 'pedidos': return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">{pedidos.slice(0, 12).map(p => <PedidoCard key={p.id} pedido={p} onFinalizar={handleFinalizarPedido} pizzaDetails={getPizzaDetails(p.pizzaName)} isHistory={false} />)}</div>;
            case 'historico': return <div className="grid grid-cols-12 gap-6 p-4 h-full"><div className={showHistorySidebar ? "col-span-12 lg:col-span-9" : "col-span-12"}><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">{historico.map(p => <PedidoCard key={p.id} pedido={p} onRetomar={handleRetomarPedido} pizzaDetails={getPizzaDetails(p.pizzaName)} isHistory={true} />)}</div></div><div className={showHistorySidebar ? "hidden lg:block col-span-3" : "hidden"}><HistorySidebar history={historico} isVisible={showHistorySidebar} /></div></div>;
            case 'menu': return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">{menu.map(p => <MenuCard key={p.name} pizza={p} onAdd={handleAddFromMenu} />)}</div>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-[#296a9a]">
            <header className="bg-white shadow-md sticky top-0 z-10 p-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-2"><div className="w-10 h-10 bg-gray-200 rounded-full"></div><h1 className="text-xl font-bold text-[#296a9a]">LaGRÉCIA Pizzaria</h1></div>
                    <nav className="flex items-center gap-2 sm:gap-4">
                        <button onClick={() => setActiveTab('pedidos')} className={`p-2 rounded-lg transition-colors ${activeTab === 'pedidos' ? 'bg-[#296a9a] text-white' : 'hover:bg-gray-100'}`}><PizzaIcon/></button>
                        <button onClick={() => setActiveTab('historico')} className={`p-2 rounded-lg transition-colors ${activeTab === 'historico' ? 'bg-[#296a9a] text-white' : 'hover:bg-gray-100'}`}><HistoryIcon/></button>
                        <button onClick={() => setActiveTab('menu')} className={`p-2 rounded-lg transition-colors ${activeTab === 'menu' ? 'bg-[#296a9a] text-white' : 'hover:bg-gray-100'}`}><MenuIcon/></button>
                         {activeTab === 'historico' && (<button onClick={() => setShowHistorySidebar(!showHistorySidebar)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block">{showHistorySidebar ? <ChevronUpIcon/> : <ChevronDownIcon />}</button>)}
                    </nav>
                </div>
            </header>
            <main className="flex-grow w-full max-w-8xl mx-auto p-4">{renderContent()}</main>
            <footer className="bg-white shadow-up w-full p-2 fixed bottom-0 right-0"><div className="max-w-7xl mx-auto flex justify-end pr-4"><div className="bg-[#296a9a] text-white rounded-full px-4 py-2 text-sm font-bold">Pedidos Ativos: {pedidos.length}</div></div></footer>
        </div>
    );
}

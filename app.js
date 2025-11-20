/* Forward Pass Playground Stub */
// Extends earlier simple networks with a deep network (panel 4).

(function initPanels() {
  const panels = Array.from(document.querySelectorAll('.panel'));
  panels.forEach(panel => { panel.dataset.ready = 'true'; });

  // Network definitions (including deep network)
  const networkDefinitions = {
    linearRegression: {
      id: 'linear-regression',
      inputs: [ { id: 'bias', label: '1', bias: true }, { id: 'x1', label: 'x₁' } ],
      outputs: [ { id: 'y', label: 'ŷ' } ],
      weights: [ { from: 'bias', to: 'y', value: 0.2 }, { from: 'x1', to: 'y', value: 0.8 } ]
    },
    multipleRegression: {
      id: 'multiple-regression',
      inputs: [ { id: 'bias', label: '1', bias: true }, { id: 'x1', label: 'x₁' }, { id: 'x2', label: 'x₂' } ],
      outputs: [ { id: 'y', label: 'ŷ' } ],
      weights: [
        { from: 'bias', to: 'y', value: 0.1 },
        { from: 'x1', to: 'y', value: 0.5 },
        { from: 'x2', to: 'y', value: -0.3 }
      ]
    },
    logisticRegression: {
      id: 'logistic-regression',
      activation: 'sigmoid',
      inputs: [ { id: 'bias', label: '1', bias: true }, { id: 'x1', label: 'x₁' } ],
      outputs: [ { id: 'y', label: 'ŷ' } ],
      weights: [ { from: 'bias', to: 'y', value: 0.3 }, { from: 'x1', to: 'y', value: -0.7 } ]
    },
    deepNetwork: {
      id: 'deep-mixed',
      type: 'deep',
      layers: {
        input: [ { id: 'bias_in', label: '1', bias: true }, { id: 'x1', label: 'x₁' } ],
        hidden: [ { id: 'bias_h', label: '1', bias: true }, { id: 'h1', label: 'h₁', activation: 'relu' }, { id: 'h2', label: 'h₂', activation: 'relu' } ],
        output: [ { id: 'y', label: 'ŷ', activation: 'sigmoid' } ]
      },
      weights: [
        { from: 'bias_in', to: 'h1', value: 0.4 },
        { from: 'x1', to: 'h1', value: -0.6 },
        { from: 'bias_in', to: 'h2', value: -0.2 },
        { from: 'x1', to: 'h2', value: 0.9 },
        { from: 'bias_h', to: 'y', value: 0.3 },
        { from: 'h1', to: 'y', value: 0.8 },
        { from: 'h2', to: 'y', value: -0.5 }
      ]
    }
  };

  // State objects
  const lrState = { x1: 0, revealed: false };
  const mrState = { x1: 0, x2: 0, revealed: false };
  const lgState = { x1: 0, revealed: false };
  const dnState = { x1: 0, revealed: false };

  // Generic shallow network renderer (panels 1–3)
  function renderNetwork(panelEl, def, state) {
    const holder = panelEl.querySelector('.canvas-holder');
    holder.classList.add('rendered');
    holder.textContent = '';
    holder.removeAttribute('data-placeholder');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 350');
    svg.setAttribute('role', 'img');
    const leftX = 140, rightX = 360, viewHeight = 350, padding = 40, nodeR = 28;
    const gapY = def.inputs.length > 1 ? (viewHeight - 2*padding) / (def.inputs.length - 1) : 0;
    const positions = {};
    def.inputs.forEach((inp,i)=>{ positions[inp.id] = { x:leftX, y: padding + i*gapY }; });
    if (def.outputs.length) {
      const firstY = positions[def.inputs[0].id].y;
      const lastY = positions[def.inputs[def.inputs.length -1].id].y;
      positions[def.outputs[0].id] = { x: rightX, y: (firstY + lastY)/2 };
    }
    // Edges
    def.weights.forEach(w=>{
      const pF = positions[w.from], pT = positions[w.to];
      const edge = document.createElementNS(svg.namespaceURI,'line');
      edge.setAttribute('x1', pF.x + nodeR); edge.setAttribute('y1', pF.y);
      edge.setAttribute('x2', pT.x - nodeR); edge.setAttribute('y2', pT.y);
      edge.classList.add('nn-edge'); svg.appendChild(edge);
      const midX = (pF.x + nodeR + pT.x - nodeR)/2, midY = (pF.y + pT.y)/2;
      const dx = pT.x - pF.x, dy = pT.y - pF.y, len = Math.hypot(dx,dy)||1;
      let perpX = -dy/len, perpY = dx/len; if (perpY>0){perpX=-perpX;perpY=-perpY;}
      const label = document.createElementNS(svg.namespaceURI,'text');
      label.textContent = `w=${w.value}`;
      label.setAttribute('x', midX + perpX*26); label.setAttribute('y', midY + perpY*26);
      label.classList.add('nn-weight-label'); svg.appendChild(label);
    });
    // Nodes
    def.inputs.forEach(inp=>{
      const pos = positions[inp.id]; const g = document.createElementNS(svg.namespaceURI,'g');
      const c = document.createElementNS(svg.namespaceURI,'circle');
      c.setAttribute('cx', pos.x); c.setAttribute('cy', pos.y); c.setAttribute('r', nodeR);
      c.classList.add('nn-node'); if (inp.bias) c.classList.add('bias'); g.appendChild(c);
      const t = document.createElementNS(svg.namespaceURI,'text');
      t.textContent = inp.bias ? '1' : (inp.id==='x1'?`x₁=${state.x1}`: (inp.id==='x2'?`x₂=${state.x2}`: inp.label));
      t.setAttribute('x', pos.x); t.setAttribute('y', pos.y); t.classList.add('nn-node-label'); g.appendChild(t); svg.appendChild(g);
    });
    def.outputs.forEach(out=>{
      const pos = positions[out.id]; const g = document.createElementNS(svg.namespaceURI,'g');
      const c = document.createElementNS(svg.namespaceURI,'circle'); c.setAttribute('cx', pos.x); c.setAttribute('cy', pos.y); c.setAttribute('r', nodeR);
      c.classList.add('nn-node','output'); if (def.activation==='sigmoid') c.classList.add('logistic'); g.appendChild(c);
      const raw = computeLinear(def, state); const yhat = def.activation==='sigmoid'? sigmoid(raw): raw;
      const t = document.createElementNS(svg.namespaceURI,'text'); t.textContent = state.revealed?`ŷ=${yhat.toFixed(3)}`:'ŷ=?';
      t.setAttribute('x', pos.x); t.setAttribute('y', pos.y); t.classList.add('nn-node-label'); g.appendChild(t); svg.appendChild(g);
    });
    holder.appendChild(svg);
  }

  // Deep network renderer (panel 4)
  function renderDeepNetwork(panelEl, def, state) {
    const holder = panelEl.querySelector('.canvas-holder'); holder.classList.add('rendered'); holder.textContent=''; holder.removeAttribute('data-placeholder');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox','0 0 500 350'); svg.setAttribute('role','img');
    const nodeR=26;
    const positions = { bias_in:{x:120,y:120}, x1:{x:120,y:220}, bias_h:{x:270,y:70}, h1:{x:270,y:150}, h2:{x:270,y:230}, y:{x:420,y:150} };
    // Edges
    def.weights.forEach(w=>{ const pf=positions[w.from], pt=positions[w.to]; const e=document.createElementNS(svg.namespaceURI,'line');
      e.setAttribute('x1',pf.x+nodeR); e.setAttribute('y1',pf.y); e.setAttribute('x2',pt.x-nodeR); e.setAttribute('y2',pt.y); e.classList.add('nn-edge'); svg.appendChild(e);
      const midX=(pf.x+nodeR+pt.x-nodeR)/2, midY=(pf.y+pt.y)/2; const dx=pt.x-pf.x, dy=pt.y-pf.y, len=Math.hypot(dx,dy)||1; let perpX=-dy/len, perpY=dx/len; if(perpY>0){perpX=-perpX;perpY=-perpY;}
      const lbl=document.createElementNS(svg.namespaceURI,'text'); lbl.textContent=`w=${w.value}`;
      // Default perpendicular offset
      let labelX = midX + perpX*18; let labelY = midY + perpY*18;
      // Special case: third weight (bias_in -> h2) moves further left for clarity
      if (w.from==='bias_in' && w.to==='h2') {
        // Fine-tuned positioning: less left, further up
        labelX = midX - 55;
        labelY = midY - 12;
      }
      lbl.setAttribute('x', labelX); lbl.setAttribute('y', labelY); lbl.classList.add('nn-weight-label'); svg.appendChild(lbl); });
    const result = computeDeep(def, state);
    function draw(node){ const pos=positions[node.id]; const g=document.createElementNS(svg.namespaceURI,'g'); const c=document.createElementNS(svg.namespaceURI,'circle');
      c.setAttribute('cx',pos.x); c.setAttribute('cy',pos.y); c.setAttribute('r',nodeR); c.classList.add('nn-node'); if(node.bias) c.classList.add('bias'); if(node.activation==='relu') c.classList.add('relu'); if(node.activation==='sigmoid') c.classList.add('output','logistic'); g.appendChild(c);
      const t=document.createElementNS(svg.namespaceURI,'text'); let text;
      if(node.bias) text='1'; else if(node.id==='x1') text=`x₁=${state.x1}`; else if(node.id==='h1'||node.id==='h2') text= state.revealed? result.values[node.id].toFixed(3): `${node.id}=?`; else if(node.id==='y') text= state.revealed? `ŷ=${result.yhat.toFixed(3)}`:'ŷ=?'; else text=node.label||node.id;
      t.textContent=text; t.setAttribute('x',pos.x); t.setAttribute('y',pos.y); t.classList.add('nn-node-label'); g.appendChild(t); svg.appendChild(g); }
    def.layers.input.forEach(draw); def.layers.hidden.forEach(draw); def.layers.output.forEach(draw);
    holder.appendChild(svg);
  }

  // Computation helpers
  function computeLinear(def, inputs) { let sum=0; def.weights.forEach(w=>{ const v = w.from==='bias'?1: inputs[w.from]; sum += w.value * v; }); return sum; }
  function sigmoid(z){ return 1/(1+Math.exp(-z)); }
  function relu(z){ return z>0?z:0; }
  function computeDeep(def, state){ const values={ bias_in:1, x1:state.x1, bias_h:1 }; const z_h1=def.weights.filter(w=>w.to==='h1').reduce((a,w)=>a + w.value*(w.from==='bias_in'?1:values[w.from]),0); const z_h2=def.weights.filter(w=>w.to==='h2').reduce((a,w)=>a + w.value*(w.from==='bias_in'?1:values[w.from]),0); values.h1=relu(z_h1); values.h2=relu(z_h2); const z_out=def.weights.filter(w=>w.to==='y').reduce((a,w)=>a + w.value*(w.from==='bias_h'?1:values[w.from]),0); const yhat=sigmoid(z_out); return { values, z_h1, z_h2, z_out, yhat }; }

  // API exposure
  window.ForwardPassPlayground = { version:'0.2.0', getPanels:()=>panels, definitions:networkDefinitions, renderNetwork, renderDeepNetwork };

  // Initial renders
  const panel1=document.getElementById('network-panel-1'); renderNetwork(panel1, networkDefinitions.linearRegression, lrState);
  const panel2=document.getElementById('network-panel-2'); renderNetwork(panel2, networkDefinitions.multipleRegression, mrState);
  const panel3=document.getElementById('network-panel-3'); renderNetwork(panel3, networkDefinitions.logisticRegression, lgState);
  const panel4=document.getElementById('network-panel-4'); renderDeepNetwork(panel4, networkDefinitions.deepNetwork, dnState);

  // Randomization helpers
  function randomInRange(min,max){ return +(Math.random()*(max-min)+min).toFixed(2); }
  function randomizeLinear(){ lrState.x1=randomInRange(-5,5); lrState.revealed=false; networkDefinitions.linearRegression.weights.forEach(w=>{ w.value = (w.from==='bias')? randomInRange(-1,1): randomInRange(-2,2); }); renderNetwork(panel1, networkDefinitions.linearRegression, lrState); }
  function revealLinear(){ if(!lrState.revealed){ lrState.revealed=true; renderNetwork(panel1, networkDefinitions.linearRegression, lrState); } }
  function randomizeMultiple(){ mrState.x1=randomInRange(-5,5); mrState.x2=randomInRange(-5,5); mrState.revealed=false; networkDefinitions.multipleRegression.weights.forEach(w=>{ if(w.from==='bias') w.value=randomInRange(-1,1); else w.value=randomInRange(-2,2); }); renderNetwork(panel2, networkDefinitions.multipleRegression, mrState); }
  function revealMultiple(){ if(!mrState.revealed){ mrState.revealed=true; renderNetwork(panel2, networkDefinitions.multipleRegression, mrState); } }
  function randomizeLogistic(){ lgState.x1=randomInRange(-5,5); lgState.revealed=false; networkDefinitions.logisticRegression.weights.forEach(w=>{ w.value = (w.from==='bias')? randomInRange(-1,1): randomInRange(-2,2); }); renderNetwork(panel3, networkDefinitions.logisticRegression, lgState); }
  function revealLogistic(){ if(!lgState.revealed){ lgState.revealed=true; renderNetwork(panel3, networkDefinitions.logisticRegression, lgState); } }
  function randomizeDeep(){ dnState.x1=randomInRange(-5,5); dnState.revealed=false; networkDefinitions.deepNetwork.weights.forEach(w=>{ if(w.from==='bias_in'||w.from==='bias_h') w.value=randomInRange(-1,1); else w.value=randomInRange(-2,2); }); renderDeepNetwork(panel4, networkDefinitions.deepNetwork, dnState); }
  function revealDeep(){ if(!dnState.revealed){ dnState.revealed=true; renderDeepNetwork(panel4, networkDefinitions.deepNetwork, dnState); } }

  // Event listeners
  const lrRand=document.getElementById('lr-random-btn'); if(lrRand) lrRand.addEventListener('click', randomizeLinear);
  const lrRev=document.getElementById('lr-reveal-btn'); if(lrRev) lrRev.addEventListener('click', revealLinear);
  const mrRand=document.getElementById('mr-random-btn'); if(mrRand) mrRand.addEventListener('click', randomizeMultiple);
  const mrRev=document.getElementById('mr-reveal-btn'); if(mrRev) mrRev.addEventListener('click', revealMultiple);
  const lgRand=document.getElementById('lg-random-btn'); if(lgRand) lgRand.addEventListener('click', randomizeLogistic);
  const lgRev=document.getElementById('lg-reveal-btn'); if(lgRev) lgRev.addEventListener('click', revealLogistic);
  const dnRand=document.getElementById('dn-random-btn'); if(dnRand) dnRand.addEventListener('click', randomizeDeep);
  const dnRev=document.getElementById('dn-reveal-btn'); if(dnRev) dnRev.addEventListener('click', revealDeep);

  // Students can randomize parameters, compute mentally, then reveal ŷ (panels 1–4; panel 4 includes ReLU + sigmoid).
})();

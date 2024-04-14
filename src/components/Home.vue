<script setup>
import { ref } from 'vue';

const smoothScroll = (id) => {
    document.querySelector(id).scrollIntoView({
        behavior: 'smooth'
    });
};

</script>
<script>
export default {
  data() {
    return {
      start: false,
      total: 0,
      inputGroups: [
        { partido: '', votos: 0 }
      ],
      datavotos: {cidade: '', votosvalidos: 0, totalvagas: 0},
      siglas: ['MDB', 'PDT', 'PSB', 'AGIR', 'MOBILIZA', 'AVANTE', 'PP', 'PSTU', 'PCB', 'PRTB', 'DC', 'PCO', 'PODE', 'REPUBLICANOS', 'PL', 'PSD', 'SOLIDARIEDADE', 'NOVO', 'PMB', 'UP', 'UNIÃO', 'PRD', 'PSDB/CIDADANIA', 'PSOL/REDE', 'PT/PCdoB/PV'],
      vagasPorPartido: {},
      partidos: {},
      vagascomsobra: {},
      vagassobra: {},
    };
  },
  methods: {
    Openstart() {
        this.start = true
    },
    TotalVotos() {
      let v = 0
      for (let i = 0; i < this.inputGroups.length; i++) {
            const item = this.inputGroups[i];
            v = v + item.votos;
        }
      this.total = v
    },
    addInputGroup() {
      this.inputGroups.push({ partido: '', votos: 0 });
    },
    Calcular() {
        // Gerar lista
        const listapartidos = {};
        for (let i = 0; i < this.inputGroups.length; i++) {
            const item = this.inputGroups[i];
            listapartidos[item.partido] = item.votos;
        }
        // Calcular o quociente eleitoral
        const quocienteEleitoral = Math.floor(this.datavotos.votosvalidos / this.datavotos.totalvagas);
        // Reordenar os Partidos por votação
        let partidosArray = Object.entries(listapartidos);
        partidosArray.sort((a, b) => b[1] - a[1]);
        var partidos = this.partidos;
        for (let [partido, votos] of partidosArray) {
            partidos[partido] = votos;
        }
        // Distribuir vagas de acordo com o quociente eleitoral
        var vagasPorPartido = this.vagasPorPartido;
        for (let partido in partidos) {
            let votosPartido = partidos[partido];
            let vagas = Math.floor(votosPartido / quocienteEleitoral);
            vagasPorPartido[partido] = vagas;
        }
            
        // Calcular as sobras de vagas
        let sobras = this.datavotos.totalvagas - Object.values(vagasPorPartido).reduce((acc, cur) => acc + cur, 0);
        
        // Distribuir sobras de vagas em rodadas
        var vagascomsobra = this.vagascomsobra;
        var vagassobra = this.vagassobra;
        for (var key in vagasPorPartido) {
            vagascomsobra[key] = vagasPorPartido[key]
        };
        for (var key in vagasPorPartido) {
            vagassobra[key] = 0
        };

        while (sobras > 0) {
            // Encontrar o partido com a maior sobra de votos
            let maiorSobra = {};
            for (let partido in partidos) {
                let sobra = partidos[partido]/(vagascomsobra[partido]+1);
                maiorSobra[partido] = sobra;
            }
            // Atribuir uma vaga ao partido com a maior sobra de votos
            let candidates = Object.keys(maiorSobra).filter(key => maiorSobra[key] === Math.max(...Object.values(maiorSobra)));
            vagascomsobra[candidates[0]]++
            vagassobra[candidates[0]]++
            sobras--;
        }

        return partidos, vagasPorPartido, vagassobra, vagascomsobra;
    }
  }
};
</script>

<template>
    <div>
        <div id="home">
            <div class="mb-5">
                <a href="/eleicoes">
                    <h2>Cálculo de Vagas - Eleições Proporcionais</h2>
                </a>
            </div>

            <div id="hero" style="margin-bottom: 80px;">
                <div>
                    <h2>
                        <span>
                            Faça sua projeção da distribuição de vagas nas próximas eleições.
                        </span>
                    </h2>
                    <p>
                        Informe a previsão de votos por partido e calcularemos a distribuição de vagas.
                    </p>
                    <a @click="smoothScroll('#start')">
                        <Button label="Começar" @click="Openstart()" class="p-button-rounded text-xl border-none mt-5 font-normal line-height-3 px-3"></Button>
                    </a>
                </div>
            </div>

            <div id="start" v-if="start">
                <div class="text-center">
                    <h2 class="text-900 font-normal mb-2">Insira os dados</h2>
                    <div class="mb-2">
                        <div for="cidade">Cidade</div>
                        <InputText v-model="datavotos.cidade" id="cidade" required />
                    </div>
                    <div class="mb-2">
                        <div for="votosvalidos">Projeção de Votos Válidos</div>
                        <InputNumber v-model="datavotos.votosvalidos" id="votosvalidos" required />
                    </div>
                    <div class="mb-3">
                        <div for="totalvagas">Total de Vagas</div>
                        <InputNumber v-model="datavotos.totalvagas" id="totalvagas" required />
                    </div>
                </div>
                <div class="text-center mb-5" style="align-content: center; align-items: center;">
                    <h2 class="text-900 font-normal mb-2">Insira os Partidos e a projeção de votos</h2>

                    <table v-for="(group, index) in inputGroups" :key="index" class="mb-2 table-container">
                        <tr style="text-align: center;">
                            <td>
                                <div>Partido</div>
                                <Dropdown v-model="group.partido" :options="siglas" placeholder="Selecione" required />
                            </td>
                            <td>
                                <div>Votos</div>
                                <InputNumber v-model="group.votos" @update:modelValue="TotalVotos" required />
                            </td>
                        </tr>
                    </table>
                    
                    <Button label="+" @click="addInputGroup()" class="p-button-rounded"></Button>
                    
                </div>

                <div>
                    <h3>Votos inseridos: {{ total }}</h3>
                    <h3>Faltam: {{ datavotos.votosvalidos - total }}</h3>
                </div>

                <Button label="Calcular" @click="Calcular()" class="p-button-rounded mb-5"></Button>

                <div v-if="Object.keys(vagasPorPartido).length > 0" class="text-center mb-5">
                    <h2 class="text-900 font-normal mb-2">Resultados para {{ datavotos.cidade }}</h2>
                    <table class="table-container mb-4">
                        <tbody>
                            <tr>
                                <td style="min-width: 100px; font-weight: bold;">PARTIDO</td>
                                <td style="min-width: 100px; font-weight: bold;">VAGAS QE</td>
                                <td style="min-width: 100px; font-weight: bold;">VAGAS SOBRAS</td>
                                <td style="min-width: 100px; font-weight: bold;">TOTAL</td>
                                <td style="min-width: 100px; font-weight: bold;">VOTOS</td>
                            </tr>
                            <tr v-for="(vagas, partido) in vagasPorPartido" style="min-width: 300px;">
                                <td>
                                    <div style="min-width: 100px;">
                                        {{ partido }}
                                    </div>
                                </td>
                                <td>
                                    <div style="min-width: 100px;">
                                        {{ vagas }}
                                    </div>
                                </td>
                                <td>
                                    <div style="min-width: 100px;">
                                        {{ vagassobra[partido] }}
                                    </div>
                                </td>
                                <td>
                                    <div style="min-width: 100px;">
                                        {{vagascomsobra[partido] }}
                                    </div>
                                </td>
                                <td>
                                    <div style="min-width: 100px;">
                                        {{ partidos[partido] }}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="min-width: 100px; font-weight: bold;">
                                        TOTAL
                                </td>
                                <td style="min-width: 100px; font-weight: bold;">
                                    {{ Object.values(vagasPorPartido).reduce((acc, cur) => acc + cur, 0) }}
                                </td>
                                <td style="min-width: 100px; font-weight: bold;">
                                    {{ Object.values(vagassobra).reduce((acc, cur) => acc + cur, 0) }}
                                </td>
                                <td style="min-width: 100px; font-weight: bold;">
                                    {{ Object.values(vagascomsobra).reduce((acc, cur) => acc + cur, 0) }}
                                </td>
                                <td style="min-width: 100px; font-weight: bold;">
                                    {{ Object.values(partidos).reduce((acc, cur) => acc + cur, 0) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <a href="/eleicoes"><Button label="Nova Distribuição" class="p-button-rounded p-button-text"></Button></a>
                </div>
            </div>

            <div>
                <div>
                    <h4 class="font-medium text-3xl text-900">Por Lindinaldo.</h4>
                </div>
            </div>
        </div>
    </div>
</template>

const pokemonList = document.getElementById('pokemonList')
const loadMoreButton = document.getElementById('loadMoreButton')
const pokemonModal = document.getElementById('pokemonModal')
const modalContent = document.getElementById('modalContent')
const modalName = document.getElementById('modalName')
const modalNumber = document.getElementById('modalNumber')
const modalTypes = document.getElementById('modalTypes')
const modalImage = document.getElementById('modalImage')
const modalAbilities = document.getElementById('modalAbilities')
const modalStats = document.getElementById('modalStats')
const modalCloseButton = document.getElementById('modalCloseButton')
let lastFocusedElement = null

const maxRecords = 151
const limit = 10
let offset = 0;
const loadedPokemons = new Map()

const maxStatValue = 255

function convertPokemonToLi(pokemon) {
    return `
        <li class="pokemon ${pokemon.type}" data-pokemon-number="${pokemon.number}" tabindex="0" role="button">
            <span class="number">#${pokemon.number}</span>
            <span class="name">${pokemon.name}</span>

            <div class="detail">
                <ol class="types">
                    ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')}
                </ol>

                <img src="${pokemon.photo}"
                     alt="${pokemon.name}">
            </div>
        </li>
    `
}

function loadPokemonItens(offset, limit) {
    pokeApi.getPokemons(offset, limit).then((pokemons = []) => {
        pokemons.forEach((pokemon) => loadedPokemons.set(pokemon.number, pokemon))
        const newHtml = pokemons.map(convertPokemonToLi).join('')
        pokemonList.innerHTML += newHtml
    })
}

function formatStatName(name) {
    return name.replace(/-/g, ' ')
}

function buildAbilityItem(ability) {
    return `
        <li class="ability-item">
            <span class="ability-name">${formatStatName(ability.name)}</span>
            <span class="ability-value">${ability.slot}</span>
        </li>
    `
}

function buildStatItem(stat) {
    const width = Math.min(100, Math.round((stat.value / maxStatValue) * 100))

    return `
        <li class="stat-item">
            <span class="stat-name">${formatStatName(stat.name)}</span>
            <span class="stat-value">${stat.value}</span>
            <div class="stat-bar">
                <span class="stat-bar-fill" style="width: ${width}%"></span>
            </div>
        </li>
    `
}

function openPokemonModal(pokemon) {
    lastFocusedElement = document.activeElement
    modalContent.className = `modal-content ${pokemon.type}`
    modalName.textContent = pokemon.name
    modalNumber.textContent = `#${pokemon.number}`
    modalImage.src = pokemon.photo
    modalImage.alt = pokemon.name
    modalTypes.innerHTML = pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join('')
    modalAbilities.innerHTML = pokemon.abilities.map(buildAbilityItem).join('')
    modalStats.innerHTML = pokemon.stats.map(buildStatItem).join('')

    pokemonModal.classList.remove('hidden')
    pokemonModal.removeAttribute('inert')
    pokemonModal.setAttribute('aria-hidden', 'false')
    modalCloseButton.focus()
}

function closePokemonModal() {
    pokemonModal.classList.add('hidden')
    pokemonModal.setAttribute('aria-hidden', 'true')
    pokemonModal.setAttribute('inert', '')
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus()
    }
}

function handleOpenModalRequest(pokemonNumber) {
    const cachedPokemon = loadedPokemons.get(pokemonNumber)

    if (cachedPokemon) {
        openPokemonModal(cachedPokemon)
        return
    }

    pokeApi.getPokemonByNumber(pokemonNumber).then(openPokemonModal)
}

loadPokemonItens(offset, limit)

pokemonList.addEventListener('click', (event) => {
    const card = event.target.closest('.pokemon')
    if (!card) {
        return
    }

    const pokemonNumber = Number(card.dataset.pokemonNumber)
    if (!Number.isNaN(pokemonNumber)) {
        handleOpenModalRequest(pokemonNumber)
    }
})

pokemonList.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
        return
    }

    const card = event.target.closest('.pokemon')
    if (!card) {
        return
    }

    event.preventDefault()
    const pokemonNumber = Number(card.dataset.pokemonNumber)
    if (!Number.isNaN(pokemonNumber)) {
        handleOpenModalRequest(pokemonNumber)
    }
})

modalCloseButton.addEventListener('click', closePokemonModal)
pokemonModal.addEventListener('click', (event) => {
    if (event.target === pokemonModal) {
        closePokemonModal()
    }
})

pokemonModal.setAttribute('inert', '')

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !pokemonModal.classList.contains('hidden')) {
        closePokemonModal()
    }
})

loadMoreButton.addEventListener('click', () => {
    offset += limit
    const qtdRecordsWithNexPage = offset + limit

    if (qtdRecordsWithNexPage >= maxRecords) {
        const newLimit = maxRecords - offset
        loadPokemonItens(offset, newLimit)

        loadMoreButton.parentElement.removeChild(loadMoreButton)
    } else {
        loadPokemonItens(offset, limit)
    }
})
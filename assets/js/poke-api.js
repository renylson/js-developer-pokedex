
const pokeApi = {}

function convertPokeApiDetailToPokemon(pokeDetail) {
    const pokemon = new Pokemon()
    pokemon.number = pokeDetail.id
    pokemon.name = pokeDetail.name

    const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name)
    const [type] = types

    pokemon.types = types
    pokemon.type = type

    pokemon.photo = pokeDetail.sprites.other.dream_world.front_default

    pokemon.abilities = pokeDetail.abilities.map((abilitySlot) => {
        return {
            name: abilitySlot.ability.name,
            slot: abilitySlot.slot
        }
    })

    pokemon.stats = pokeDetail.stats.map((statSlot) => {
        return {
            name: statSlot.stat.name,
            value: statSlot.base_stat
        }
    })

    return pokemon
}

pokeApi.getPokemonDetail = (pokemon) => {
    return fetch(pokemon.url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
}

pokeApi.getPokemons = (offset = 0, limit = 5) => {
    const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`

    return fetch(url)
        .then((response) => response.json())
        .then((jsonBody) => jsonBody.results)
        .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
        .then((detailRequests) => Promise.all(detailRequests))
        .then((pokemonsDetails) => pokemonsDetails)
}

    pokeApi.getPokemonByNumber = (number) => {
        const url = `https://pokeapi.co/api/v2/pokemon/${number}`

        return fetch(url)
        .then((response) => response.json())
        .then(convertPokeApiDetailToPokemon)
    }

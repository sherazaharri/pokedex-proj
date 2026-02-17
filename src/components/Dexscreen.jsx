import '../css/Dexscreen.css';

import bugimg from '../assets/type/bugimg.png';
import darkimg from '../assets/type/darkimg.png';
import dragonimg from '../assets/type/dragonimg.png';
import electricimg from '../assets/type/electricimg.png';
import fairyimg from '../assets/type/fairyimg.png';
import fighting from '../assets/type/fightingimg.png';
import fireimg from '../assets/type/fireimg.png';
import flyingimg from '../assets/type/flyingimg.png';
import ghostimg from '../assets/type/ghostimg.png';
import grassimg from '../assets/type/grassimg.png';
import groundimg from '../assets/type/groundimg.png';
import iceimg from '../assets/type/iceimg.png';
import normalimg from '../assets/type/normalimg.png';
import poisonimg from '../assets/type/poisonimg.png';
import psychicimg from '../assets/type/psychicimg.png';
import rockimg from '../assets/type/rockimg.png';
import steelimg from '../assets/type/steelimg.png';
import waterimg from '../assets/type/waterimg.png';

import downimg from '../assets/downarrow.png'

import { useRef, useState, useEffect, use } from 'react';



function Dexscreen(){
    const [pokemonSprite, setPokemonSprite] = useState(null);
    const [currPokemon, setCurrPokemon] = useState("");
    const [nameDisplay, setNameDisplay] = useState("");
    const [pokeType, setPokeType] = useState([]);
    const [pokeText, setPokeText] = useState("");
    const [pokeHeight, setPokeHeight] = useState("");
    const [pokeWeight, setPokeWeight] = useState("");
    const [pokeStats, setPokeStats] = useState([]);
    const [pokeChain, setPokeChain] = useState([]);
    const [chainSprites, setChainSprites] = useState([]);
    const [dataFound, setDataFound] = useState(false);
    const [isLoading, setIsLoading] = useState(false);


    const typeImages = {
        bug: bugimg,
        dark: darkimg,
        dragon: dragonimg,
        electric: electricimg,
        fairy: fairyimg,
        fighting: fighting,
        fire: fireimg,
        flying: flyingimg,
        ghost: ghostimg,
        grass: grassimg,
        ground: groundimg,
        ice: iceimg,
        normal: normalimg,
        poison: poisonimg,
        psychic: psychicimg,
        rock: rockimg,
        steel: steelimg,
        water: waterimg
    };

    function abbreviateStat(name) {
        switch (name) {
            case "hp": return "HP";
            case "attack": return "ATK";
            case "defense": return "DEF";
            case "special-attack": return "SPA";
            case "special-defense": return "SPD";
            case "speed": return "SPE";
            default: return name;
        }
    }

    function capitalize(str){
        if(str == null){
            return("");
        }
        return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
    }

    function cleanFlavorText(text) {
        return text.replace(/\f|\n|\r/g, " ").replace(/\s+/g, " ").trim();
    }

    function handleNameInput(event){
        if(event.key == 'Enter'){
            setCurrPokemon(event.target.value);
        }
    }

    function chainRecursion(chain, stage, tempChain){
        if(chain.evolves_to == []){
            return 0
        }
            
        const currStage = chain.species.name;
        if(tempChain[stage] == undefined){
            tempChain.push([])
        }
        tempChain[stage].push(currStage)
        for (const i in chain.evolves_to){
            chainRecursion(chain.evolves_to[i], stage + 1, tempChain);
        }
    }

    useEffect(() => {
        const tempPokeArray = [];

        async function getImage(){
            for(const currStage of pokeChain){
                for(const currPoke of currStage){
                    const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${currPoke}`)
                    if(!response1.ok){
                        throw new Error("Could not fetch resource");
                    }

                    const data1 = await response1.json();
                    const currSprite = data1.sprites.front_default;
                    tempPokeArray.push(
                        {
                            name: currPoke,
                            sprite: currSprite
                        }
                    );
                }
            }
            setChainSprites(tempPokeArray);
        }

        getImage();
        setIsLoading(false);
    }, [pokeChain])

    async function fetchData(option){
        setPokeType([]);
        const tempChain = [];
        setNameDisplay(capitalize(option));

        const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${option}`)
        if(!response1.ok){
            setDataFound(false);
            throw new Error("Could not fetch resource");
        }else{
            setDataFound(true);
        }

        const response2 = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${option}/`)
        if(!response2.ok){
            throw new Error("Could not fetch resource");
        }

        const data1 = await response1.json();
        const data2 = await response2.json();

        const currSprite = data1.sprites.front_default; /*get pokemon sprite*/
        setPokemonSprite(currSprite);  

        const currType = data1.types; /*get pokemon typing*/
        for(var i in currType){
            const temp = currType[i].type.name;
            setPokeType(prevType => [...prevType, temp]);
        }

        const filteredBio = data2.flavor_text_entries.filter(f => f.language.name == "en");  /*get latest en pokemon flavour text */
        const currBio = filteredBio[filteredBio.length - 1].flavor_text
        setPokeText(cleanFlavorText(currBio));

        const currHeight = data1.height; /*get pokemon height */
        setPokeHeight((currHeight*10).toFixed(2));

        const currWeight = data1.weight; /*get pokemon weight */
        setPokeWeight((currWeight*0.1).toFixed(2));

        const stats = data1.stats.map(s => ({ /*get pokemon stats */
                name: abbreviateStat(s.stat.name),
                stat: s.base_stat
            })
        );
        setPokeStats(stats);

        const url = data2.evolution_chain.url; /*get evolution chain*/
        const evoChain = await fetch(url);
        const chainData = await evoChain.json();
        chainRecursion(chainData.chain, 0, tempChain);
        setPokeChain(tempChain);
    }

    useEffect(() => {
        if(!currPokemon){
            return
        }

        setIsLoading(true);

        async function waitForData(){
            const option = currPokemon.toLowerCase().trimEnd();
            const response1 = await fetch(`https://pokeapi.co/api/v2/pokemon/${option}`)
            if(!response1.ok){
                setDataFound(false);
                setIsLoading(false);
                throw new Error("Could not fetch resource");
            }else{
                setDataFound(true);
                await fetchData(option);
            }    
        }

        waitForData();
    }, [currPokemon]);

    return(
        <div className='dexScreen'>
            <h1 className='welcomeText'>Welcome!</h1>
            <div className='dexContent'>
                <input type='text' id='inputBox' className='pokemonEnter' placeholder='Enter Pokémon here!' onKeyDown={handleNameInput}></input>
                {isLoading ? (
                    <div className='loadingScreen'>
                        <h1>Loading...</h1>
                    </div> 
                ): (
                    dataFound ? (
                        <div className='pokemonResult'>
                            <div className='pokemonData'>
                                <img className='pokemonSprite' src={pokemonSprite}></img>
                                <p>{nameDisplay}</p>
                                <div className='pokemonType'>
                                {
                                    pokeType.map(type => (
                                    <img key={type} className='typeImg' src={typeImages[type]} alt={type}/>
                                    ))
                                }
                                </div>
                            </div>
                            <div className='pokemonBio'>
                                <p className='flavorText'>{pokeText}</p>
                                <div className='pokemonBm'>
                                    <p>Height: {pokeHeight} cm</p>
                                    <p>Weight: {pokeWeight} kg</p>
                                </div>
                                <div className='pokemonStats'>
                                        {
                                            pokeStats.map(cstat => (
                                                <div key={cstat.name} className='statsRow'>
                                                    <p className='statName'>{cstat.name}</p>
                                                    <div className='containerStats'>
                                                        <div className='statsBar' style={{ width: `${(cstat.stat*100)/255}%` }}></div>
                                                    </div> 
                                                    <p>{cstat.stat}</p>
                                                </div>
                                            ))
                                        }
                                </div>
                                <div className='pokemonEvolution'>
                                    <h2>Evolutions</h2>
                                    {
                                        pokeChain.length == 1 && (
                                            <p className='noEvo'>This Pokemon has no evolutions</p>
                                        )
                                    }
                                    {
                                        pokeChain.map((row, rowIndex) => (
                                            <div key={rowIndex} className='evoWhole'>
                                                <div className='evoRow'>
                                                    {
                                                        row.map(cpoke => (
                                                            <div key={cpoke} className='evoItem'>
                                                                <img src={chainSprites.find(p => p.name === cpoke)?.sprite} alt={cpoke} className='evoSprite'/>
                                                                <p>{capitalize(chainSprites.find(n => n.name ==  cpoke)?.name)}</p>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                                {rowIndex < pokeChain.length - 1 && (
                                                    <img src={downimg} alt="down arrow" className='downImg'/>
                                                )}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='notFound'>
                            <h1>DATA NOT FOUND</h1>
                            <p>Start searching for a Pokémon!</p>
                        </div>  
                    )
                )}
            </div>
        </div> 
    );
}

export default Dexscreen;
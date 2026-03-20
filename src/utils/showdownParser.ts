// utils/showdownParser.ts
export function parseShowdownExport(text: string) {
    const lines = text.trim().split('\n');
    const data: any = {
      name: '',
      item: '',
      ability: '',
      level: 50,
      shiny: false,
      nature: '',
      evs: {},
      ivs: {},
      moves: [],
    };
  
    let currentSection = '';
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('@')) {
        data.item = line.slice(1).trim();
      } else if (line.startsWith('Ability:')) {
        data.ability = line.replace('Ability:', '').trim();
      } else if (line.startsWith('Level:')) {
        data.level = parseInt(line.replace('Level:', '').trim());
      } else if (line === 'Shiny: Yes') {
        data.shiny = true;
      } else if (line.includes('Nature')) {
        data.nature = line.replace(' Nature', '').trim();
      } else if (line.startsWith('EVs:')) {
        const evParts = line.replace('EVs:', '').trim().split(' / ');
        evParts.forEach(part => {
          const [val, stat] = part.trim().split(' ');
          data.evs[stat.toLowerCase()] = parseInt(val);
        });
      } else if (line.startsWith('IVs:')) {
        // similar for IVs
      } else if (line.startsWith('- ')) {
        data.moves.push(line.replace('- ', '').trim());
      } else if (!line.includes(':')) {
        // First line usually name @ item
        if (!data.name) data.name = line.split('@')[0].trim();
      }
    });
  
    return data;
  }
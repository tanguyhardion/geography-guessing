import type { Department } from "../types";

export const departments: Department[] = [
  { id: "01", name: "Ain", chefLieu: "Bourg-en-Bresse" },
  { id: "02", name: "Aisne", chefLieu: "Laon" },
  { id: "03", name: "Allier", chefLieu: "Moulins" },
  { id: "04", name: "Alpes-de-Haute-Provence", chefLieu: "Digne-les-Bains" }, // Mountainous department in Provence-Alpes-Côte d'Azur
  { id: "05", name: "Hautes-Alpes", chefLieu: "Gap" }, // Alpine department known for ski resorts and high peaks
  { id: "06", name: "Alpes-Maritimes", chefLieu: "Nice" }, // French Riviera department on Mediterranean coast
  { id: "07", name: "Ardèche", chefLieu: "Privas" }, // Rhône-Alpes department famous for its gorges and chestnut forests
  { id: "08", name: "Ardennes", chefLieu: "Charleville-Mézières" }, // Northern department bordering Belgium and Luxembourg
  // { id: "09", name: "Ariège", chefLieu: "Foix" },
  { id: "10", name: "Aube", chefLieu: "Troyes" }, // Champagne-Ardenne department famous for medieval architecture
  { id: "11", name: "Aude", chefLieu: "Carcassonne" }, // Languedoc department with famous medieval fortress city
  { id: "12", name: "Aveyron", chefLieu: "Rodez" }, // Midi-Pyrénées department known for Roquefort cheese
  { id: "13", name: "Bouches-du-Rhône", chefLieu: "Marseille" }, // Mediterranean department containing France's second largest city
  { id: "14", name: "Calvados", chefLieu: "Caen" }, // Normandy department famous for D-Day beaches and apple brandy
  { id: "15", name: "Cantal", chefLieu: "Aurillac" }, // Auvergne department in the Massif Central with volcanic landscapes
  { id: "16", name: "Charente", chefLieu: "Angoulême" }, // Poitou-Charentes department famous for Cognac production
  { id: "17", name: "Charente-Maritime", chefLieu: "La Rochelle" }, // Atlantic coast department with historic ports
  { id: "18", name: "Cher", chefLieu: "Bourges" }, // Centre-Val de Loire department with Gothic cathedral
  { id: "19", name: "Corrèze", chefLieu: "Tulle" }, // Limousin department in central France plateau
  { id: "2A", name: "Corse-du-Sud", chefLieu: "Ajaccio" }, // Southern Corsica department, birthplace of Napoleon
  { id: "2B", name: "Haute-Corse", chefLieu: "Bastia" }, // Northern Corsica department with mountainous terrain
  { id: "21", name: "Côte-d'Or", chefLieu: "Dijon" }, // Burgundy department famous for wine and mustard
  { id: "22", name: "Côtes-d'Armor", chefLieu: "Saint-Brieuc" }, // Brittany department on English Channel coast
  { id: "23", name: "Creuse", chefLieu: "Guéret" }, // Limousin department in central France, least populated
  { id: "24", name: "Dordogne", chefLieu: "Périgueux" }, // Aquitaine department famous for prehistoric caves and foie gras
  { id: "25", name: "Doubs", chefLieu: "Besançon" }, // Franche-Comté department on Swiss border
  { id: "26", name: "Drôme", chefLieu: "Valence" }, // Rhône-Alpes department known for lavender and nougat
  { id: "27", name: "Eure", chefLieu: "Évreux" }, // Normandy department with Château Gaillard ruins
  { id: "28", name: "Eure-et-Loir", chefLieu: "Chartres" }, // Centre region department with famous cathedral
  { id: "29", name: "Finistère", chefLieu: "Quimper" }, // Westernmost department of Brittany with Celtic heritage
  { id: "30", name: "Gard", chefLieu: "Nîmes" }, // Languedoc department with Roman monuments
  { id: "31", name: "Haute-Garonne", chefLieu: "Toulouse" }, // Midi-Pyrénées department with aerospace industry
  { id: "32", name: "Gers", chefLieu: "Auch" }, // Gascony department famous for Armagnac brandy
  { id: "33", name: "Gironde", chefLieu: "Bordeaux" }, // Aquitaine department renowned for wine production
  { id: "34", name: "Hérault", chefLieu: "Montpellier" }, // Languedoc department on Mediterranean coast
  { id: "35", name: "Ille-et-Vilaine", chefLieu: "Rennes" }, // Brittany department with regional capital
  { id: "36", name: "Indre", chefLieu: "Châteauroux" }, // Centre-Val de Loire department in Berry region
  { id: "37", name: "Indre-et-Loire", chefLieu: "Tours" }, // Loire Valley department famous for châteaux
  { id: "38", name: "Isère", chefLieu: "Grenoble" }, // Alpine department that hosted 1968 Winter Olympics
  { id: "39", name: "Jura", chefLieu: "Lons-le-Saunier" }, // Franche-Comté department known for Comté cheese
  { id: "40", name: "Landes", chefLieu: "Mont-de-Marsan" }, // Aquitaine department with extensive pine forests
  { id: "41", name: "Loir-et-Cher", chefLieu: "Blois" }, // Loire Valley department with Renaissance château
  { id: "42", name: "Loire", chefLieu: "Saint-Étienne" }, // Rhône-Alpes department with industrial heritage
  { id: "43", name: "Haute-Loire", chefLieu: "Le Puy-en-Velay" }, // Auvergne department with volcanic peaks
  { id: "44", name: "Loire-Atlantique", chefLieu: "Nantes" }, // Pays de la Loire department with major Atlantic port
  { id: "45", name: "Loiret", chefLieu: "Orléans" }, // Centre-Val de Loire department with historic royal city
  { id: "46", name: "Lot", chefLieu: "Cahors" }, // Midi-Pyrénées department famous for black wine
  { id: "47", name: "Lot-et-Garonne", chefLieu: "Agen" }, // Aquitaine department known for prunes
  { id: "48", name: "Lozère", chefLieu: "Mende" }, // Languedoc department, least populated in mainland France
  { id: "49", name: "Maine-et-Loire", chefLieu: "Angers" }, // Pays de la Loire department in Anjou region
  { id: "50", name: "Manche", chefLieu: "Saint-Lô" }, // Normandy department with Cotentin Peninsula
  { id: "51", name: "Marne", chefLieu: "Châlons-en-Champagne" }, // Champagne-Ardenne department famous for sparkling wine
  { id: "52", name: "Haute-Marne", chefLieu: "Chaumont" }, // Champagne-Ardenne department with plateau landscape
  { id: "53", name: "Mayenne", chefLieu: "Laval" }, // Pays de la Loire department in Mayenne river valley
  { id: "54", name: "Meurthe-et-Moselle", chefLieu: "Nancy" }, // Lorraine department with Art Nouveau architecture
  { id: "55", name: "Meuse", chefLieu: "Bar-le-Duc" }, // Lorraine department with WWI battlefields
  { id: "56", name: "Morbihan", chefLieu: "Vannes" }, // Brittany department with Gulf of Morbihan
  { id: "57", name: "Moselle", chefLieu: "Metz" }, // Lorraine department on German border
  { id: "58", name: "Nièvre", chefLieu: "Nevers" }, // Burgundy department in Morvan region
  { id: "59", name: "Nord", chefLieu: "Lille" }, // Northern department on Belgian border with industrial heritage
  { id: "60", name: "Oise", chefLieu: "Beauvais" }, // Picardy department with Gothic cathedral
  { id: "61", name: "Orne", chefLieu: "Alençon" }, // Normandy department known for lace making
  { id: "62", name: "Pas-de-Calais", chefLieu: "Arras" }, // Northern department with English Channel coastline
  { id: "63", name: "Puy-de-Dôme", chefLieu: "Clermont-Ferrand" }, // Auvergne department with volcanic chain
  { id: "64", name: "Pyrénées-Atlantiques", chefLieu: "Pau" }, // Aquitaine department with Basque coast and Pyrenees
  { id: "65", name: "Hautes-Pyrénées", chefLieu: "Tarbes" }, // Midi-Pyrénées department with high mountain peaks
  { id: "66", name: "Pyrénées-Orientales", chefLieu: "Perpignan" }, // Languedoc department bordering Spain
  { id: "67", name: "Bas-Rhin", chefLieu: "Strasbourg" }, // Alsace department with European Parliament
  { id: "68", name: "Haut-Rhin", chefLieu: "Colmar" }, // Alsace department famous for wine route
  { id: "69", name: "Rhône", chefLieu: "Lyon" }, // Rhône-Alpes department with France's third largest city
  { id: "70", name: "Haute-Saône", chefLieu: "Vesoul" }, // Franche-Comté department with rolling hills
  { id: "71", name: "Saône-et-Loire", chefLieu: "Mâcon" }, // Burgundy department known for wine and gastronomy
  { id: "72", name: "Sarthe", chefLieu: "Le Mans" }, // Pays de la Loire department famous for 24-hour race
  { id: "73", name: "Savoie", chefLieu: "Chambéry" }, // Alpine department with ski resorts
  { id: "74", name: "Haute-Savoie", chefLieu: "Annecy" }, // Alpine department with Lake Annecy and Mont Blanc
  { id: "75", name: "Paris", chefLieu: "Paris" }, // Capital department and most populated city
  { id: "76", name: "Seine-Maritime", chefLieu: "Rouen" }, // Normandy department with major port Le Havre
  { id: "77", name: "Seine-et-Marne", chefLieu: "Melun" }, // Île-de-France department with Disneyland Paris
  { id: "78", name: "Yvelines", chefLieu: "Versailles" }, // Île-de-France department with famous palace
  { id: "79", name: "Deux-Sèvres", chefLieu: "Niort" }, // Poitou-Charentes department with Marais Poitevin wetlands
  { id: "80", name: "Somme", chefLieu: "Amiens" }, // Picardy department with WWI battlefields
  { id: "81", name: "Tarn", chefLieu: "Albi" }, // Midi-Pyrénées department with UNESCO cathedral
  { id: "82", name: "Tarn-et-Garonne", chefLieu: "Montauban" }, // Midi-Pyrénées department with pink brick architecture
  { id: "83", name: "Var", chefLieu: "Toulon" }, // Provence department with Mediterranean naval base
  { id: "84", name: "Vaucluse", chefLieu: "Avignon" }, // Provence department with papal palace
  { id: "85", name: "Vendée", chefLieu: "La Roche-sur-Yon" }, // Pays de la Loire department with Atlantic beaches
  { id: "86", name: "Vienne", chefLieu: "Poitiers" }, // Poitou-Charentes department with historic university
  { id: "87", name: "Haute-Vienne", chefLieu: "Limoges" }, // Limousin department famous for porcelain
  { id: "88", name: "Vosges", chefLieu: "Épinal" }, // Lorraine department with mountain range
  { id: "89", name: "Yonne", chefLieu: "Auxerre" }, // Burgundy department with Chablis wine region
  { id: "90", name: "Territoire de Belfort", chefLieu: "Belfort" }, // Franche-Comté department, smallest in mainland France
  { id: "91", name: "Essonne", chefLieu: "Évry-Courcouronnes" }, // Île-de-France department in Paris suburbs
  { id: "92", name: "Hauts-de-Seine", chefLieu: "Nanterre" }, // Île-de-France department with La Défense business district
  { id: "93", name: "Seine-Saint-Denis", chefLieu: "Bobigny" }, // Île-de-France department north of Paris
  { id: "94", name: "Val-de-Marne", chefLieu: "Créteil" }, // Île-de-France department southeast of Paris
  { id: "95", name: "Val-d'Oise", chefLieu: "Cergy-Pontoise" }, // Cergy or Pontoise, officially Cergy-Pontoise for the agglomeration
  // Overseas Departments
  { id: "971", name: "Guadeloupe", chefLieu: "Basse-Terre" }, // Caribbean archipelago department in Lesser Antilles
  { id: "972", name: "Martinique", chefLieu: "Fort-de-France" }, // Caribbean island department in Lesser Antilles
  { id: "973", name: "Guyane", chefLieu: "Cayenne" }, // South American department with tropical rainforest
  { id: "974", name: "La Réunion", chefLieu: "Saint-Denis" }, // Indian Ocean island department east of Madagascar
  { id: "976", name: "Mayotte", chefLieu: "Mamoudzou" }, // Dzaoudzi was the former chef-lieu
];

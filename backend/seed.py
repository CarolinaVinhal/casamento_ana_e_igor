import json
import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import inspect, text

from database import Base, SessionLocal, engine
from models import Contribution, Gift, Guest

HERE = os.path.dirname(os.path.abspath(__file__))

# ==============================================================================
# LISTA OFICIAL DE CONVIDADOS — um item por CONVITE (casal, família ou pessoa sozinha).
# Quem está no mesmo convite confirma junto. Acentos podem ser usados normalmente.
# ==============================================================================
CONVITES = [
    ["Fernando Cezar Ribeiro", "Daisy Maria Uchôa Freire Ribeiro"],
    ["Fernando Cezar Ribeiro Junior", "Laura Costa Barreto"],
    ["Simone Mendonça Uchôa", "Guilherme Telles Piva"],
    ["Tiffany Uchôa Jarjour"],
    ["Aziz Abdala Jarjour"],
    ["Estefânia Mendonça Uchôa"],
    ["Maíra Uchôa Ribas", "Victor Rondon"],
    ["Taína Uchôa Roselino"],
    ["Maria Silvia Mendonça Uchôa"],
    ["Oswaldo Freire da Fonseca Junior", "Katia Amorim"],
    ["Feres Jaber"],
    ["Fabiano Jaber"],
    ["Feres Jaber Junior"],
    ["Feres Jaber Neto"],
    ["Paulo Ribeiro"],
    ["Sueli Ribeiro"],
    ["Sandra Ribeiro"],
    ["Luiz Ribeiro"],
    ["José Gonçalves Ribeiro"],
    ["Diana Uchôa Torres Lima", "Flávio Rezende Campos", "Henrique Uchôa Campos", "Bruna Uchôa Campos"],
    ["Maria Luiza Uchôa Torres Lima"],
    ["Lucia Arantes", "Genny Costa"],
    ["Paulo Junior Arantes"],
    ["João Henrique", "Cristiane"],
    ["Daniela Fortes"],
    ["Cristiano Fortes"],
    ["Loiany Ribeiro"],
    ["Coralina Marques", "Márcio Vinhal"],
    ["Carolina Marques Vinhal", "Rafael Martins"],
    ["Nathalia Marques Vinhal", "Matheus Baracat"],
    ["Luiza Amelia Marques Vinhal", "Leonardo Krumnenauer"],
    ["Solange Barros", "Paulo Barros"],
    ["Maria Clara Barros"],
    ["Josiane Carmona", "Sebastião José Ferreira Neto"],
    ["Henrique Ferreira Carmona", "Carolina Passareli"],
    ["Eduardo Ferreira Carmona"],
    ["Daniel Ferreira Carmona", "Letícia Lafetá"],
    ["Noelia Beltran", "Vitório Beltran"],
    ["Marília Pinheiro Nogueira", "Rodrigo Nogueira"],
    ["Pedro Pinheiro Nogueira"],
    ["Marcelo Pinheiro Nogueira", "Alice Vidigal de Oliveira"],
    ["Cláudio Rodrigues de Sousa"],
    ["Sueli de Jesus Caldas"],
    ["Meire Oliveira"],
    ["Amílcar Gasperin Barreto", "Ana Claudia Oliveira Costa Barreto"],
    ["Isadora Costa Barreto"],
    ["Rogério Tokarski", "Romelita Tokarski"],
    ["Romy Tokarski", "Geraldo Gaya"],
    ["Rogy Milagres Tokarski", "Frederico Bonincontro"],
    ["Cecin Sarkis Simão", "Dark Sarkis"],
    ["Cirônia Oliveira", "Ricardo Oliveira"],
    ["Roosevelt Vilela", "Camila Vilela"],
    ["Waldevan Alves de Oliveira", "Rosa Marta Magalhães de Oliveira"],
    ["Eduardo Henrique M de Oliveira", "Olivia Alcântara S Oliveira"],
    ["Rycardo Henrique M de Oliveira", "Adejaina Rocha G Oliveira"],
    ["Janaina Calheiros", "Eduardo Calheiros"],
    ["Márcia Orsovay", "Paulo Orsovay"],
    ["Patrícia Uchôa Cansação"],
    ["Ana Paula Uchôa Fernandes", "Becão"],
    ["Sabrina Fernandes"],
    ["Giovana Fernandes"],
    ["Juliana Uchôa", "Luis Machado"],
    ["Maria Claudia Luna", "Marcelo Valente"],
    ["Maria Virginia", "Eurico Uchôa"],
    ["Rodrigo", "Candice"],
    ["Karen", "Júlio Uchôa"],
    ["Maria Teresa Uchôa"],
    ["Maria Julieta Uchôa"],
    ["Valeria Uchôa"],
    ["Maria Amelia Uchôa"],
    ["Luiza Peres Sabino Diniz", "Mateus Chiarini"],
    ["Brenda Morais de Oliveira", "Leonardo Seixas"],
    ["Gabriel Richers", "Mirella Salles"],
    ["Pedro Ibarra", "Luiza Ceruti"],
    ["Natalia Veloso", "Mateus Se"],
    ["Ana Carolina Jreige", "Matheus Soares Matos"],
    ["Daniela Almeida de Sousa", "Marcos Dias Coelho Costa"],
    ["Giovana Milena de Assis Mendonça", "Edson Luiz Castro de Carvalho"],
    ["Kamilla Sandrianne Araújo Ferreira", "João Pedro Carvalho"],
    ["Laura Jezini Mota", "Iago Gouvêa do Carmo e Silva"],
    ["Leandro Vaz da Silva Borges", "Daniele Lopes"],
    ["Isadora Vargas Cunha"],
    ["Ludmilla Simeão Ferreira dos Santos"],
    ["Carlos Eduardo Lima Souza", "David Ricardo"],
    ["Alice Cristina Castro", "Eduardo Campelo"],
    ["Vitória Reis"],
    ["Pamella Rodrigues André", "Ana Seguti"],
    ["Isabel Perez"],
    ["Maria Carolina Vasconcelos Figueira Marques", "Rafael da Silva Figueira Marques"],
    ["Maria Clara Peixoto"],
    ["Evelen de Souza Barreto Lyra", "Carlos Alberto Lyra"],
    ["Karina Cabús Nascimento", "Rafael Silva Nascimento"],
    ["André Henriques Reis Gomes"],
    ["Lucas Augusto Trento Galloro"],
    ["Lucas Aquino Costa"],
    ["Alexandre Magalhães Sette Torres"],
    ["Márcia de Souza Oliveira Resende", "Clayton Martins Resende"],
    ["Júlia Martins Oliveira", "Roberth Lopes"],
    ["Vicente Leovir de Oliveira"],
    ["Maria Abadia Martins Resende"],
    ["Fernando Martins Resende"],
    ["Marcelo de Souza Oliveira", "Sheila Linhares"],
    ["Maria Eduarda Linhares de Oliveira", "Gabriel Sousa"],
    ["Ana Laura Linhares de Oliveira"],
    ["Valéria Lopes Martins Pereira", "Márcio Roberto"],
    ["Camila Martins Pereira"],
    ["Luiza Martins Pereira", "Ricardo"],
    ["Clayton Martins"],
    ["Jucelia Chicou dos Reis", "Luis Marcos dos Reis"],
    ["Luis Marcos dos Reis Júnior", "Natalia dos Reis"],
    ["Gabriel Felipe Alencar dos Reis"],
    ["Vitor Lucas Alencar dos Reis", "Nayra Magnani"],
    ["Daniel Bertarini", "Juliana Minucio", "Pedro", "Cecília"],
    ["Hugo Mirindiba Bonfim Palmeira", "Fernanda Kiyomi"],
    ["João Pedro Valim Rosa", "Juliana Malta Moreira"],
    ["João Lucas Pereira do Carmo", "Milena Peixoto"],
    ["Luan Marra", "Lorena Mendonça"],
    ["Savio Dias", "Carolina Mendonça"],
    ["Lucas Quintino", "Amanda Bianchini"],
    ["Matheus Natan", "Karolina Lacerda"],
    ["Ricardo Amâncio"],
    ["João Vitor Rincon", "Marielen Bertuol"],
    ["Danton Dornelas", "Iasmim Penha"],
    ["Gabriel Almeida", "Amanda Jhessy"],
    ["Frederico de Pina", "Letícia Coutinho Midlej"],
    ["Marcelo Passos", "Vitória Caetano"],
    ["Marcus Vinícius Cordeiro Costa", "Maria Natalia Terra de Assis"],
    ["Mateus Barcelos Coppolla", "Eypril Fernandes"],
    ["Pablo Vinícius", "Maria Clara Potiguara"],
    ["Thiago Medeiros", "Maria Eduarda Rabelo Trigueiros"],
    ["Rafael Almeida"],
    ["Isabelle Monte"],
    ["Filipe Bittencourt"],
    ["Juliana Chen"],
    ["Guilherme Moreira"],
    ["Eduardo Teodoro"],
    ["Aldir Cleber", "Raquel Lopes"],
    ["João Luiz Honório", "Júlia Santana de Sá"],
    ["Luis Guilherme Jardim Borges", "Vanessa Sumihara"],
    ["Beatriz Almeida", "Elias Sanches"],
    ["César Augusto Ludovico", "Caroline Brasil"],
    ["Matheus Mechilis", "Gabriela Sobrinho"],
    ["André Luiz Pacheco", "Mariana Erthal"],
    ["Vinícius Castro", "Mariana Camargo"],
    ["Kelvin Paulino", "Julia Reis"],
    ["Kelvin Pessoa", "Letícia Câmara Pessoa"],
    ["Rômulo Rocha Sousa", "Luana Gomes"],
    ["Gustavo Faber", "Ingrid Silva"],
    ["João Pedro Alves"],
    ["Marcos Franco", "Ingrid Góes"],
    ["Priscila Lorena Carvalho Alves", "Alex Cortes Alves"],
]


def ensure_columns():
    """
    Mini-migração: o create_all() não adiciona colunas novas em tabelas que já existem
    (ex.: banco do Neon criado com a versão anterior). Aqui adicionamos o que faltar.
    """
    insp = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not insp.has_table(table.name):
                continue
            existing = {c["name"] for c in insp.get_columns(table.name)}
            for col in table.columns:
                if col.name not in existing:
                    col_type = col.type.compile(dialect=engine.dialect)
                    conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {col.name} {col_type}'))
                    print(f"[MIGRAÇÃO] coluna {table.name}.{col.name} adicionada")


def seed_database():
    Base.metadata.create_all(bind=engine)
    ensure_columns()
    db = SessionLocal()
    try:
        # 1. Convidados (adiciona os que faltarem e atualiza o convite de cada um)
        by_name = {g.full_name: g for g in db.query(Guest).all()}
        added = 0
        for convite in CONVITES:
            group = " & ".join(convite)
            for name in convite:
                guest = by_name.get(name)
                if guest is None:
                    db.add(Guest(full_name=name, group_name=group))
                    added += 1
                else:
                    guest.group_name = group

        # Remove quem saiu da lista (ex.: nomes de teste), desde que ainda não tenha respondido
        official = {name for convite in CONVITES for name in convite}
        removed = 0
        for name, guest in by_name.items():
            if name not in official and guest.rsvp is None:
                db.delete(guest)
                removed += 1

        # 2. Presentes — mesmos IDs, títulos e preços do app.js (arquivo gifts_seed.json)
        with open(os.path.join(HERE, "gifts_seed.json"), encoding="utf-8") as f:
            gifts = json.load(f)
        ids = {g["id"] for g in gifts}
        for g in gifts:
            gift = db.get(Gift, g["id"])
            if gift is None:
                db.add(Gift(**g))
            else:  # atualiza textos/preços sem perder o status de "já presenteado"
                for key, value in g.items():
                    setattr(gift, key, value)
        # remove presentes que saíram da lista (só se ninguém deu ainda)
        used = {c.gift_id for c in db.query(Contribution.gift_id).distinct()}
        for gift in db.query(Gift).filter(~Gift.id.in_(ids)).all():
            if gift.id not in used:
                db.delete(gift)

        db.commit()
        print(f"[SEED] {added} convidados novos, {removed} removidos | {len(gifts)} presentes sincronizados")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()

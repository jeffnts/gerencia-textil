import Report from '../models/ReportModel'
import Piece from '../models/PieceModel'

module.exports = {
  createReport: async (data) =>{
    const { pieces, workers } = data

    try {
      const report = Report.create(
        {
          pieces,
          workers
        }
      )

      await report.save()

      return ({
        data: report,
        message: 'Relatório cadastrado com sucesso'
      })
    }catch (error) {
      return 'Erro ao tentar cadastrar o relatório.' + error.message
    }
  },

  getAllReports: async ( name, sort = '-createdAt', limit=5 ) =>{
    try {

      let query = {}

      if (name) {
        query = {name: new RegExp(escapeRegex(name), 'gi')}
      } else {
        query = {}
      }



      const data = await Report.find(query,{sort})

      let piece
      let pieces = []
      let amount
      let reports = []

      let i

      for(i = 0; i < data.length; i++){
        for(let j = 0; j < data[i].pieces.length; j++){
          piece = await Piece.findOne({_id: data[i].pieces[j].piece})
          amount = data[i].pieces[j].amount
        }
        pieces.push({
          piece,
          amount
        })

        reports.push({
          _id: data[i]._id,
          name: data[i].name,
          pieces,
          workers: data[i].workers
        })
      }

      return reports
    }catch (error) {
      return 'Erro ao tentar listar os relatórios.' + error.message
    }


    //Fuzzy search function
    function escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
    }
  },
  getOneReport: async (id) =>{
    try {
      const data = await Report.findOne({_id: id},{ populate: ['pieces.piece']})
      let pieces = []
      let amount
      let piece

      for(let i = 0; i < data.pieces.length; i++){
        amount = data.pieces[i].amount
        piece = await Piece.findOne({_id: data.pieces[i].piece})

        pieces.push({
          amount,
          piece
        })
      }

      const report = {
        _id: data._id,
        name: data.name,
        workers: data.workers,
        pieces
      }
      return report
    }catch (error) {
     return 'Erro ao tentar listar o relatório.', error
    }
  },

  updateReport: async (id, data) =>{
    try {
      const { pieces, workers } = data
      const report = await Report.findOneAndUpdate({_id: id}, {
        pieces,
        workers
      })


      return ({
        data: report,
        message: 'Relatório atualizado com sucesso'
      })
    }catch (error) {
      return 'Erro ao tentar editar o relatório.'
    }
  },

  removeReport: async (id) =>{
    try {
      await Report.deleteOne({_id: id})

      return 'Relatório removido com sucesso'
    }catch (error) {
      return 'Erro ao tentar remover o relatório.'
    }
  },
}

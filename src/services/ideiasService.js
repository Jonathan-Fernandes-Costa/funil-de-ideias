import { supabase } from '../lib/supabase';

export const ideiasService = {
  // Buscar todas as ideias com contadores
  async listar() {
    const { data, error } = await supabase
      .from('view_ideias_com_contadores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Buscar ideia por ID
  async buscarPorId(id) {
    const { data, error } = await supabase
      .from('view_ideias_com_contadores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Criar nova ideia
  async criar(ideia, autorId) {
    // 1. Criar a ideia
    const { data: novaIdeia, error: ideiaError } = await supabase
      .from('ideias')
      .insert({
        titulo: ideia.titulo,
        descricao: ideia.descricao,
        fonte: ideia.fonte || null,
        segmento: ideia.segmento || null,
        impacto: ideia.impacto || null,
        autor_id: autorId
      })
      .select()
      .single();

    if (ideiaError) throw ideiaError;

    // 2. Processar tags (se houver)
    if (ideia.tags && ideia.tags.length > 0) {
      for (const tagNome of ideia.tags) {
        // Verificar se tag existe ou criar
        let { data: tagExistente } = await supabase
          .from('tags')
          .select('id')
          .eq('nome', tagNome.toLowerCase())
          .single();

        let tagId;
        if (!tagExistente) {
          const { data: novaTag } = await supabase
            .from('tags')
            .insert({ nome: tagNome.toLowerCase() })
            .select('id')
            .single();
          tagId = novaTag.id;
        } else {
          tagId = tagExistente.id;
        }

        // Associar tag à ideia
        await supabase
          .from('ideia_tags')
          .insert({ ideia_id: novaIdeia.id, tag_id: tagId });
      }
    }

    return novaIdeia;
  },

  // Atualizar status da ideia
  async atualizarStatus(id, novoStatus, justificativa = null) {
    const updateData = { status: novoStatus };
    if (justificativa) {
      updateData.justificativa_rejeicao = justificativa;
    }

    const { data, error } = await supabase
      .from('ideias')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Assumir ownership de uma ideia
  async assumirOwnership(ideiaId, userId) {
    const { data, error } = await supabase
      .from('ideias')
      .update({ owner_id: userId })
      .eq('id', ideiaId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Buscar ideias por status
  async buscarPorStatus(status) {
    const { data, error } = await supabase
      .from('view_ideias_com_contadores')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Contar ideias por status
  async contarPorStatus() {
    const { data, error } = await supabase
      .from('ideias')
      .select('status');

    if (error) throw error;

    const contagem = {
      total: data.length,
      'Geração': 0,
      'Em Definição': 0,
      'Pronta para Avaliação': 0,
      'Aprovada': 0,
      'Arquivada': 0
    };

    data.forEach(item => {
      if (contagem[item.status] !== undefined) {
        contagem[item.status]++;
      }
    });

    return contagem;
  }
};

export const votosService = {
  // Verificar se usuário já votou
  async verificarVoto(ideiaId, userId) {
    const { data, error } = await supabase
      .from('votos')
      .select('*')
      .eq('ideia_id', ideiaId)
      .eq('usuario_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  },

  // Adicionar voto
  async votar(ideiaId, userId) {
    const { error } = await supabase
      .from('votos')
      .insert({ ideia_id: ideiaId, usuario_id: userId });

    if (error) throw error;
    return true;
  },

  // Remover voto
  async removerVoto(ideiaId, userId) {
    const { error } = await supabase
      .from('votos')
      .delete()
      .eq('ideia_id', ideiaId)
      .eq('usuario_id', userId);

    if (error) throw error;
    return true;
  },

  // Toggle voto (votar ou desvotar)
  async toggleVoto(ideiaId, userId) {
    const jaVotou = await this.verificarVoto(ideiaId, userId);
    if (jaVotou) {
      await this.removerVoto(ideiaId, userId);
      return false;
    } else {
      await this.votar(ideiaId, userId);
      return true;
    }
  }
};

export const comentariosService = {
  // Listar comentários de uma ideia
  async listar(ideiaId) {
    const { data, error } = await supabase
      .from('comentarios')
      .select(`
        *,
        autor:usuarios(id, nome, email, avatar_url)
      `)
      .eq('ideia_id', ideiaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Adicionar comentário
  async criar(ideiaId, autorId, conteudo) {
    const { data, error } = await supabase
      .from('comentarios')
      .insert({
        ideia_id: ideiaId,
        autor_id: autorId,
        conteudo
      })
      .select(`
        *,
        autor:usuarios(id, nome, email, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar comentário
  async deletar(comentarioId) {
    const { error } = await supabase
      .from('comentarios')
      .delete()
      .eq('id', comentarioId);

    if (error) throw error;
    return true;
  }
};

export const avaliacoesService = {
  // Criar avaliação
  async criar(avaliacao) {
    const { data, error } = await supabase
      .from('avaliacoes')
      .insert(avaliacao)
      .select()
      .single();

    if (error) throw error;

    // Atualizar status da ideia baseado na decisão
    await ideiasService.atualizarStatus(
      avaliacao.ideia_id,
      avaliacao.decisao,
      avaliacao.decisao === 'Arquivada' ? avaliacao.justificativa : null
    );

    return data;
  },

  // Buscar avaliações de uma ideia
  async buscarPorIdeia(ideiaId) {
    const { data, error } = await supabase
      .from('avaliacoes')
      .select(`
        *,
        avaliador:usuarios(id, nome, email)
      `)
      .eq('ideia_id', ideiaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

export const definicaoService = {
  // Buscar definição de produto
  async buscar(ideiaId) {
    const { data, error } = await supabase
      .from('definicao_produto')
      .select('*')
      .eq('ideia_id', ideiaId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Criar ou atualizar definição
  async salvar(ideiaId, definicao) {
    const existente = await this.buscar(ideiaId);

    if (existente) {
      const { data, error } = await supabase
        .from('definicao_produto')
        .update(definicao)
        .eq('ideia_id', ideiaId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('definicao_produto')
        .insert({ ...definicao, ideia_id: ideiaId })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  }
};

export const anexosService = {
  // Listar anexos de uma ideia
  async listar(ideiaId) {
    const { data, error } = await supabase
      .from('anexos')
      .select(`
        *,
        uploader:usuarios(id, nome, email)
      `)
      .eq('ideia_id', ideiaId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Upload de arquivo
  async upload(ideiaId, file, userId) {
    // Gerar nome único para o arquivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${ideiaId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const storagePath = `anexos/${fileName}`;

    // Upload para o Storage
    const { error: uploadError } = await supabase.storage
      .from('anexos-ideias')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Salvar metadados no banco
    const { data, error: dbError } = await supabase
      .from('anexos')
      .insert({
        ideia_id: ideiaId,
        nome_arquivo: file.name,
        storage_path: storagePath,
        tipo_mime: file.type,
        tamanho_bytes: file.size,
        uploaded_by: userId
      })
      .select(`
        *,
        uploader:usuarios(id, nome, email)
      `)
      .single();

    if (dbError) throw dbError;
    return data;
  },

  // Obter URL pública do arquivo
  async getPublicUrl(storagePath) {
    const { data } = supabase.storage
      .from('anexos-ideias')
      .getPublicUrl(storagePath);
    
    return data.publicUrl;
  },

  // Download do arquivo
  async download(storagePath, nomeOriginal) {
    const { data, error } = await supabase.storage
      .from('anexos-ideias')
      .download(storagePath);

    if (error) throw error;

    // Criar link de download
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeOriginal;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Deletar anexo
  async deletar(anexoId, storagePath) {
    // Deletar do Storage
    const { error: storageError } = await supabase.storage
      .from('anexos-ideias')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Deletar do banco
    const { error: dbError } = await supabase
      .from('anexos')
      .delete()
      .eq('id', anexoId);

    if (dbError) throw dbError;
    return true;
  }
};

export const checklistService = {
  // Listar itens do checklist de uma ideia
  async listar(ideiaId) {
    const { data, error } = await supabase
      .from('checklist_definicao')
      .select('*')
      .eq('ideia_id', ideiaId)
      .order('categoria', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Adicionar item ao checklist
  async criar(ideiaId, categoria, item) {
    const { data, error } = await supabase
      .from('checklist_definicao')
      .insert({
        ideia_id: ideiaId,
        categoria,
        item,
        concluido: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar status de um item
  async toggleConcluido(itemId, concluido) {
    const { data, error } = await supabase
      .from('checklist_definicao')
      .update({ concluido })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Deletar item do checklist
  async deletar(itemId) {
    const { error } = await supabase
      .from('checklist_definicao')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  },

  // Criar itens padrão para uma ideia
  async criarItensPadrao(ideiaId) {
    const itensPadrao = [
      { categoria: 'Encaixe Organizacional', item: 'Alinhamento estratégico definido' },
      { categoria: 'Encaixe Organizacional', item: 'Capacidade técnica avaliada' },
      { categoria: 'Encaixe Organizacional', item: 'Recursos disponíveis identificados' },
      { categoria: 'Análise de Mercado', item: 'Público-alvo definido' },
      { categoria: 'Análise de Mercado', item: 'Mercado mapeado' },
      { categoria: 'Proposta de Valor', item: 'Hipóteses de valor documentadas' },
      { categoria: 'Proposta de Valor', item: 'Estimativa de rentabilidade feita' }
    ];

    const { data, error } = await supabase
      .from('checklist_definicao')
      .insert(itensPadrao.map(i => ({ ...i, ideia_id: ideiaId })))
      .select();

    if (error) throw error;
    return data;
  }
};

export const usuariosService = {
  // Buscar usuário por ID
  async buscarPorId(userId) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  // Atualizar perfil do usuário
  async atualizarPerfil(userId, dados) {
    const { data, error } = await supabase
      .from('usuarios')
      .update({
        nome: dados.nome,
        avatar_url: dados.avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Upload de avatar
  async uploadAvatar(userId, file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const storagePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(storagePath);

    // Atualizar avatar_url no perfil
    await this.atualizarPerfil(userId, { avatar_url: urlData.publicUrl });

    return urlData.publicUrl;
  }
};

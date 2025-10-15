import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/types';

export async function saveDataToSupabase(data: AppData, bakeryId: string): Promise<boolean> {
  try {
    console.log('💾 Iniciando salvamento no Supabase...', { bakeryId, data });
    
    // Verificar sessão antes de qualquer operação
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('❌ Sessão inválida ao tentar salvar:', sessionError);
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // 1. Atualizar bakeries (settings)
    console.log('📝 Salvando settings completo:', JSON.stringify(data.settings, null, 2));
    
    const updateData = {
      confectionery_name: data.settings.brandName,
      settings: data.settings,
      updated_at: new Date().toISOString(),
    };
    
    console.log('📝 Dados que serão atualizados na tabela bakeries:', updateData);
    
    console.log('🔄 [SUPABASE] Executando UPDATE em bakeries com timeout de 10s...');
    const { error: bakeryError } = await Promise.race([
      supabase.from('bakeries').update(updateData).eq('id', bakeryId),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('UPDATE bakeries travou por mais de 10 segundos')), 10000)
      )
    ]) as { error: any };
    console.log('✅ [SUPABASE] UPDATE em bakeries concluído', { 
      bakeryError: bakeryError?.message || 'sem erro' 
    });

    if (bakeryError) {
      console.error('❌ Erro ao atualizar bakery:', bakeryError);
      throw bakeryError;
    }
    console.log('✅ Bakery atualizada com sucesso! Settings salvos incluindo:', {
      brandName: data.settings.brandName,
      logoImage: data.settings.logoImage ? '✅ tem logo' : '❌ sem logo',
      heroImage: data.settings.heroImage ? '✅ tem hero' : '❌ sem hero',
      colorBackgroundRosa: data.settings.colorBackgroundRosa || 'padrão',
      colorButtonPrimary: data.settings.colorButtonPrimary || 'padrão',
    });

    // 2. Deletar produtos antigos e inserir novos
    console.log('🔄 Deletando produtos antigos...');
    try {
      console.log('🔄 [SUPABASE] Executando DELETE em products com timeout de 10s...');
      const { error: deleteProductsError } = await Promise.race([
        supabase.from('products').delete().eq('bakery_id', bakeryId),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('DELETE products travou por mais de 10 segundos')), 10000)
        )
      ]) as { error: any };
      console.log('✅ [SUPABASE] DELETE em products concluído', { 
        deleteProductsError: deleteProductsError?.message || 'sem erro' 
      });

      if (deleteProductsError) throw deleteProductsError;
      console.log('✅ Produtos antigos deletados');
    } catch (err) {
      console.error('❌ Erro ao deletar produtos antigos:', err);
      throw err;
    }

    if (data.products && data.products.length > 0) {
      console.log('🔄 Inserindo novos produtos...');
      try {
        const productsToInsert = data.products.map((product) => ({
          id: product.id,
          bakery_id: bakeryId,
          name: product.name,
          price: product.sizes[0]?.price || 0,
          description: product.description,
          image_url: product.image,
          sizes: product.sizes,
          tags: product.tags || [],
          show_image: product.showImage !== false,
          product_order: product.order || 0,
        }));

        console.log('🔄 [SUPABASE] Executando INSERT em products com timeout de 10s...');
        const { error: productsError } = await Promise.race([
          supabase.from('products').insert(productsToInsert),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('INSERT products travou por mais de 10 segundos')), 10000)
          )
        ]) as { error: any };
        console.log('✅ [SUPABASE] INSERT em products concluído', { 
          productsError: productsError?.message || 'sem erro' 
        });

        if (productsError) throw productsError;
        console.log(`✅ ${productsToInsert.length} produtos inseridos com IDs mantidos`);
      } catch (err) {
        console.error('❌ Erro ao inserir produtos:', err);
        throw err;
      }
    }

    // 3. Deletar extras antigos e inserir novos
    console.log('🔄 Deletando extras antigos...');
    try {
      console.log('🔄 [SUPABASE] Executando DELETE em extras...');
      const { error: deleteExtrasError } = await supabase
        .from('extras')
        .delete()
        .eq('bakery_id', bakeryId);
      console.log('✅ [SUPABASE] DELETE em extras concluído', { 
        deleteExtrasError: deleteExtrasError?.message || 'sem erro' 
      });

      if (deleteExtrasError) throw deleteExtrasError;
      console.log('✅ Extras antigos deletados');
    } catch (err) {
      console.error('❌ Erro ao deletar extras antigos:', err);
      throw err;
    }

    if (data.extras && data.extras.length > 0) {
      console.log('🔄 Inserindo novos extras...');
      try {
        const extrasToInsert = data.extras.map((extra) => ({
          bakery_id: bakeryId,
          name: extra.name,
          description: extra.description,
          image_url: extra.image,
          price: extra.price,
          extra_order: extra.order || 0,
        }));

        console.log('🔄 [SUPABASE] Executando INSERT em extras...');
        const { error: extrasError } = await supabase
          .from('extras')
          .insert(extrasToInsert);
        console.log('✅ [SUPABASE] INSERT em extras concluído', { 
          extrasError: extrasError?.message || 'sem erro' 
        });

        if (extrasError) throw extrasError;
        console.log(`✅ ${extrasToInsert.length} extras inseridos`);
      } catch (err) {
        console.error('❌ Erro ao inserir extras:', err);
        throw err;
      }
    }

    // 4. Deletar sections antigas e inserir novas
    console.log('🔄 Deletando sections antigas...');
    try {
      console.log('🔄 [SUPABASE] Executando DELETE em sections...');
      const { error: deleteSectionsError } = await supabase
        .from('sections')
        .delete()
        .eq('bakery_id', bakeryId);
      console.log('✅ [SUPABASE] DELETE em sections concluído', { 
        deleteSectionsError: deleteSectionsError?.message || 'sem erro' 
      });

      if (deleteSectionsError) throw deleteSectionsError;
      console.log('✅ Sections antigas deletadas');
    } catch (err) {
      console.error('❌ Erro ao deletar sections antigas:', err);
      throw err;
    }

    if (data.sections && data.sections.length > 0) {
      console.log('🔄 Inserindo novas sections...');
      try {
        const sectionsToInsert = data.sections.map((section) => ({
          id: section.id,
          bakery_id: bakeryId,
          name: section.name,
          visible: section.visible !== false,
          section_order: section.order || 0,
          product_ids: section.productIds || [],
        }));

        console.log('🔄 [SUPABASE] Executando INSERT em sections...');
        const { error: sectionsError } = await supabase
          .from('sections')
          .insert(sectionsToInsert);
        console.log('✅ [SUPABASE] INSERT em sections concluído', { 
          sectionsError: sectionsError?.message || 'sem erro' 
        });

        if (sectionsError) throw sectionsError;
        console.log(`✅ ${sectionsToInsert.length} sections inseridas com IDs e vínculos mantidos`);
      } catch (err) {
        console.error('❌ Erro ao inserir sections:', err);
        throw err;
      }
    }

    // 5. Deletar tags antigas e inserir novas
    console.log('🔄 Deletando tags antigas...');
    try {
      console.log('🔄 [SUPABASE] Executando DELETE em tags...');
      const { error: deleteTagsError } = await supabase
        .from('tags')
        .delete()
        .eq('bakery_id', bakeryId);
      console.log('✅ [SUPABASE] DELETE em tags concluído', { 
        deleteTagsError: deleteTagsError?.message || 'sem erro' 
      });

      if (deleteTagsError) throw deleteTagsError;
      console.log('✅ Tags antigas deletadas');
    } catch (err) {
      console.error('❌ Erro ao deletar tags antigas:', err);
      throw err;
    }

    if (data.tags && data.tags.length > 0) {
      console.log('🔄 Inserindo novas tags...');
      try {
        const tagsToInsert = data.tags.map((tag) => ({
          id: tag.id,
          bakery_id: bakeryId,
          name: tag.name,
          color: tag.color,
          emoji: tag.emoji,
        }));

        console.log('🔄 [SUPABASE] Executando INSERT em tags...');
        const { error: tagsError } = await supabase
          .from('tags')
          .insert(tagsToInsert);
        console.log('✅ [SUPABASE] INSERT em tags concluído', { 
          tagsError: tagsError?.message || 'sem erro' 
        });

        if (tagsError) throw tagsError;
        console.log(`✅ ${tagsToInsert.length} tags inseridas com IDs mantidos`);
      } catch (err) {
        console.error('❌ Erro ao inserir tags:', err);
        throw err;
      }
    }

    console.log('✅ Todos os dados salvos com sucesso no Supabase!');
    return true;
  } catch (error: any) {
    console.error('❌ Erro geral ao salvar no Supabase:', error);
    // ✅ PROPAGAR o erro para que AdminPanel.tsx possa tratá-lo
    throw error;
  }
}

export async function loadDataFromSupabase(bakeryId: string): Promise<AppData | null> {
  try {
    console.log('📥 Carregando dados do Supabase...', { bakeryId });

    // 1. Carregar bakery
    const { data: bakery, error: bakeryError } = await supabase
      .from('bakeries')
      .select('*')
      .eq('id', bakeryId)
      .single();

    if (bakeryError || !bakery) {
      console.error('❌ Erro ao carregar bakery:', bakeryError);
      return null;
    }
    console.log('✅ Bakery carregada:', bakery);

    // 2. Carregar produtos
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('product_order', { ascending: true });

    if (productsError) {
      console.error('❌ Erro ao carregar produtos:', productsError);
    }
    console.log('✅ Produtos carregados:', products?.length || 0);

    // 3. Carregar extras
    const { data: extras, error: extrasError } = await supabase
      .from('extras')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('extra_order', { ascending: true });

    if (extrasError) {
      console.error('❌ Erro ao carregar extras:', extrasError);
    }
    console.log('✅ Extras carregados:', extras?.length || 0);

    // 4. Carregar sections
    const { data: sections, error: sectionsError } = await supabase
      .from('sections')
      .select('*')
      .eq('bakery_id', bakeryId)
      .order('section_order', { ascending: true });

    if (sectionsError) {
      console.error('❌ Erro ao carregar sections:', sectionsError);
    }
    console.log('✅ Sections carregadas:', sections?.length || 0);

    // 5. Carregar tags
    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('*')
      .eq('bakery_id', bakeryId);

    if (tagsError) {
      console.error('❌ Erro ao carregar tags:', tagsError);
    }
    console.log('✅ Tags carregadas:', tags?.length || 0);

    // 6. Montar AppData - SEM DEFAULTS, apenas dados do Supabase
    console.log('🔍 Settings do banco:', bakery.settings);
    console.log('🔍 Nome da confeitaria:', bakery.confectionery_name);
    
    const appData: AppData = {
      settings: bakery.settings || {
        brandName: bakery.confectionery_name || '',
        showLogo: false,
        showName: false,
        showHeroLogo: false,
        heroImagePosition: 'center',
        heroOverlayColor: '#000000',
        heroOverlayOpacity: 0.5,
        heroTitle: '',
        heroSubtitle: '',
        whatsappNumber: '',
        whatsappMessage: '',
        aboutTitle: '',
        aboutText: '',
        showAbout: false,
        extraInfoTitle: '',
        extraInfoText: '',
        showExtraInfo: false,
        footerText: '',
        adminPassword: '',
      },
      products: (products || []).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        image: p.image_url,
        showImage: p.show_image !== false,
        tags: (p.tags as string[]) || [],
        order: p.product_order || 0,
        sizes: (p.sizes as any) || [{ id: 'default', name: 'Padrão', price: Number(p.price) }],
      })),
      extras: (extras || []).map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description || '',
        image: e.image_url,
        price: Number(e.price),
        order: e.extra_order || 0,
      })),
      sections: (sections || []).map((s) => ({
        id: s.id,
        name: s.name,
        visible: s.visible !== false,
        order: s.section_order || 0,
        productIds: (s.product_ids as string[]) || [],
      })),
      tags: (tags || []).map((t) => ({
        id: t.id,
        name: t.name,
        color: t.color,
        emoji: t.emoji || '',
      })),
    };

    console.log('✅ Dados completos carregados do Supabase:', appData);
    return appData;
  } catch (error) {
    console.error('❌ Erro geral ao carregar do Supabase:', error);
    return null;
  }
}

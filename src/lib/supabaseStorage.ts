import { supabase } from '@/integrations/supabase/client';
import { AppData } from '@/types';

export async function saveDataToSupabase(data: AppData, bakeryId: string): Promise<boolean> {
  try {
    console.log('💾 Iniciando salvamento no Supabase...', { bakeryId, data });

    // 1. Atualizar bakeries (settings)
    const { error: bakeryError } = await supabase
      .from('bakeries')
      .update({
        confectionery_name: data.settings.brandName,
        settings: data.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bakeryId);

    if (bakeryError) {
      console.error('❌ Erro ao atualizar bakery:', bakeryError);
      throw bakeryError;
    }
    console.log('✅ Bakery atualizada com sucesso');

    // 2. Deletar produtos antigos e inserir novos
    const { error: deleteProductsError } = await supabase
      .from('products')
      .delete()
      .eq('bakery_id', bakeryId);

    if (deleteProductsError) {
      console.error('❌ Erro ao deletar produtos antigos:', deleteProductsError);
      throw deleteProductsError;
    }
    console.log('✅ Produtos antigos deletados');

    if (data.products && data.products.length > 0) {
      const productsToInsert = data.products.map((product) => ({
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

      const { error: productsError } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (productsError) {
        console.error('❌ Erro ao inserir produtos:', productsError);
        throw productsError;
      }
      console.log(`✅ ${productsToInsert.length} produtos inseridos`);
    }

    // 3. Deletar extras antigos e inserir novos
    const { error: deleteExtrasError } = await supabase
      .from('extras')
      .delete()
      .eq('bakery_id', bakeryId);

    if (deleteExtrasError) {
      console.error('❌ Erro ao deletar extras antigos:', deleteExtrasError);
      throw deleteExtrasError;
    }
    console.log('✅ Extras antigos deletados');

    if (data.extras && data.extras.length > 0) {
      const extrasToInsert = data.extras.map((extra) => ({
        bakery_id: bakeryId,
        name: extra.name,
        description: extra.description,
        image_url: extra.image,
        price: extra.price,
        extra_order: extra.order || 0,
      }));

      const { error: extrasError } = await supabase
        .from('extras')
        .insert(extrasToInsert);

      if (extrasError) {
        console.error('❌ Erro ao inserir extras:', extrasError);
        throw extrasError;
      }
      console.log(`✅ ${extrasToInsert.length} extras inseridos`);
    }

    // 4. Deletar sections antigas e inserir novas
    const { error: deleteSectionsError } = await supabase
      .from('sections')
      .delete()
      .eq('bakery_id', bakeryId);

    if (deleteSectionsError) {
      console.error('❌ Erro ao deletar sections antigas:', deleteSectionsError);
      throw deleteSectionsError;
    }
    console.log('✅ Sections antigas deletadas');

    if (data.sections && data.sections.length > 0) {
      const sectionsToInsert = data.sections.map((section) => ({
        bakery_id: bakeryId,
        name: section.name,
        visible: section.visible !== false,
        section_order: section.order || 0,
        product_ids: section.productIds || [],
      }));

      const { error: sectionsError } = await supabase
        .from('sections')
        .insert(sectionsToInsert);

      if (sectionsError) {
        console.error('❌ Erro ao inserir sections:', sectionsError);
        throw sectionsError;
      }
      console.log(`✅ ${sectionsToInsert.length} sections inseridas`);
    }

    // 5. Deletar tags antigas e inserir novas
    const { error: deleteTagsError } = await supabase
      .from('tags')
      .delete()
      .eq('bakery_id', bakeryId);

    if (deleteTagsError) {
      console.error('❌ Erro ao deletar tags antigas:', deleteTagsError);
      throw deleteTagsError;
    }
    console.log('✅ Tags antigas deletadas');

    if (data.tags && data.tags.length > 0) {
      const tagsToInsert = data.tags.map((tag) => ({
        bakery_id: bakeryId,
        name: tag.name,
        color: tag.color,
        emoji: tag.emoji,
      }));

      const { error: tagsError } = await supabase
        .from('tags')
        .insert(tagsToInsert);

      if (tagsError) {
        console.error('❌ Erro ao inserir tags:', tagsError);
        throw tagsError;
      }
      console.log(`✅ ${tagsToInsert.length} tags inseridas`);
    }

    console.log('✅ Todos os dados salvos com sucesso no Supabase!');
    return true;
  } catch (error) {
    console.error('❌ Erro geral ao salvar no Supabase:', error);
    return false;
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

    // 6. Montar AppData
    const appData: AppData = {
      settings: (bakery.settings as any) || {
        brandName: bakery.confectionery_name,
        showLogo: false,
        showName: true,
        showHeroLogo: false,
        heroImagePosition: 'center',
        heroOverlayColor: '#000000',
        heroOverlayOpacity: 0.5,
        heroTitle: `Bem-vindo à ${bakery.confectionery_name}`,
        heroSubtitle: 'Doces artesanais feitos com carinho',
        whatsappNumber: '',
        whatsappMessage: 'Olá! Gostaria de fazer um pedido:',
        aboutTitle: 'Sobre Nós',
        aboutText: 'Somos uma confeitaria artesanal dedicada a criar doces deliciosos.',
        showAbout: true,
        extraInfoTitle: 'Informações Importantes',
        extraInfoText: 'Faça seu pedido com antecedência!',
        showExtraInfo: true,
        footerText: `© ${new Date().getFullYear()} ${bakery.confectionery_name}. Todos os direitos reservados.`,
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

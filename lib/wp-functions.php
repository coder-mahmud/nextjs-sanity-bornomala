/**
 * Send a webhook to Next.js for revalidation
 *
 * @param int $post_id
 * @param WP_Post $post
 */
function send_revalidate_webhook($post_id, $post) {
  // Only run for published or updated posts
  if (wp_is_post_revision($post_id)) {
    return;
  }

  // Only send when post is published (optional)
  if ($post->post_status !== 'publish') {
    //return;
  }

  // Your frontend revalidation endpoint
  $webhook_url = 'http://localhost:3000/api/revalidate';

  // Build custom payload
  $body = [
    'secret'    => 'mahmud4758',
    'postId'    => $post_id,
    'postType'  => $post->post_type,
    'postSlug'  => $post->post_name,
    'action'    => 'post_published_or_updated',
  ];

  // Send webhook
  $response = wp_remote_post($webhook_url, [
    'method'      => 'POST',
    'timeout'     => 15,
    'body'        => wp_json_encode($body),
    'headers'     => [
      'Content-Type' => 'application/json',
    ],
  ]);

  // Debug (optional)
  if (is_wp_error($response)) {
    error_log('Webhook failed: ' . $response->get_error_message());
  } else {
    error_log('Webhook sent: ' . wp_remote_retrieve_body($response));
  }
}
add_action('save_post', 'send_revalidate_webhook', 10, 2);

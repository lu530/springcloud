package cn.fclub.article.test;

import redis.clients.jedis.*;

import java.util.*;

public class RedisTest {
    private static JedisPool jedisPool = null;
    private static JedisCluster jedisCluster = RedisTest.getInstance();
    private static Jedis jedis =  null;
    public static JedisCluster getInstance(){
        if(jedisCluster==null){
            JedisPoolConfig config = new JedisPoolConfig(); // Jedis连接池
            config.setMaxIdle(8); // 最大空闲连接数
            config.setMaxTotal(8);// 最大连接数
            config.setMaxWaitMillis(8000); // 获取连接是的最大等待时间，如果超时就抛出异常
            config.setTestOnBorrow(false);// 在borrow一个jedis实例时，是否提前进行validate操作；如果为true，则得到的jedis实例均是可用的；
            //	     jedisPool = new JedisPool(config, "127.0.0.1", 6379, 5000, "LN7PX+LIwVcay0BVtK5A4w==", 0); // 配置、ip、端口、连接超时时间、密码、数据库编号（0~15）

            Set<HostAndPort> nodes = new HashSet<>();
            nodes.add(new HostAndPort("172.25.22.43",7000));
            nodes.add(new HostAndPort("172.25.22.44",7000));
            nodes.add(new HostAndPort("172.25.22.45",7000));
            nodes.add(new HostAndPort("172.25.22.43",7001));
            nodes.add(new HostAndPort("172.25.22.44",7001));
            nodes.add(new HostAndPort("172.25.22.45",7001));
            nodes.add(new HostAndPort("172.25.22.43",7002));
            nodes.add(new HostAndPort("172.25.22.44",7002));
            nodes.add(new HostAndPort("172.25.22.45",7002));
            jedisCluster = new JedisCluster(nodes);

            //jedisPool = new JedisPool(config, "127.0.0.1", 6379, 5000, "foobared", 0);
        }
        return jedisCluster;
    }

    public static void main(String[] args) throws InterruptedException {
        //String();
        list();
        //set();
        //sets();
        //map();
        //zset();
        //zsets();
//		https://blog.csdn.net/z23546498/article/details/73556260
     //   subscribe();publisher();
    }
    /**
     * string类型的基本操作，string是redis的最基本数据类型，很多操作都是其他数据类型能用的，如del、exists、expire
     * @throws Exception
     */
    public static void String() throws InterruptedException{
        jedis.set("name", "王小强");
        //	jedis.flushDB(); // 清空数据库
        System.out.println(jedis.get("name"));
        jedis.incr("www");// 自增，不存在testInt则自增结果是1，如果不是字符串，自增会报JedisDataException
        System.out.println(jedis.get("www"));
        jedis.decr("www");//递减
        System.out.println(jedis.get("www"));
        jedis.append("name", "xcl");//在key为www的value追加 3333
        System.out.println(jedis.get("name"));
        String subname = jedis.substr("name", 0, 5);
        System.out.println(subname);
        jedis.rename("name", "wname");// 字段改名，值不会变
        System.out.println(jedis.get("wname"));
        System.out.println(jedis.type("wname"));
        System.out.println(jedis.type("www"));
        long length = jedis.strlen("wname"); // 获取字符串长度
        System.out.println(length);

        jedis.set("www1", "小黑");
        jedis.set("www2", "火枪");
        jedis.set("www3", "斧王");
        jedis.set("www4", "哈斯卡");
        Set<String> set = jedis.keys("*");
        System.out.println(set);
        Set<String> set1 = jedis.keys("*www?");
        System.out.println(set1);

        long a =jedis.del("www4");// 字符串删除
        System.out.println(a+":是否存在："+jedis.exists("www4"));//是否存在

        jedis.set("hello", "你好呀");
        jedis.expire("hello", 2);// 设置有效期，单位是秒
        long t = jedis.ttl("hello"); // ttl方法可以返回剩余有效时间，expire如果方法不指定时间，就是将该字段有效期设为无限
        System.out.println(t);
        System.out.println(jedis.get("hello"));
        Thread.sleep(3000);
        System.out.println(jedis.get("hello"));
    }
    /**
     * list类的基本操作，有序可重复
     *
     */
    public static void  list(){
        jedisCluster.lpush("wlist", "蓝胖");// 从左边插入
        jedisCluster.lpush("wlist", "隐刺");
        jedisCluster.lpush("wlist", "幻刺");
        jedisCluster.lpush("wlist", "凤凰");
        jedisCluster.rpush("wlist", "军团");// 从右边插入
        List<String> list = jedisCluster.lrange("wlist", 0, -1);// 从左到右遍历，3个参数分别是，key，开始位置，结束位置（-1代表到最后）
        for (String string : list) {
            System.out.println(string);
        }
        String lpop = jedisCluster.lpop("wlist");// 删掉最左边的那个
        String rpop = jedisCluster.rpop("wlist");// 删掉最右边的那个
        System.out.printf("被删的左边元素是：%s，被删的右边元素是：%s\n", lpop, rpop);
        jedisCluster.ltrim("wlist", 1, 2); // 裁剪列表，三个参数分别是，key，开始位置，结束位置
        list = jedisCluster.lrange("wlist", 0, -1);
        for (int i = 0; i < list.size(); i++) {
            System.out.printf("从redis中获取被裁剪后的wlist[%d]: %s\n", i, list.get(i));
        }
       // jedisCluster.del("wlist"); // 删除列表
        System.out.println("从redis删除wlist后，wlist是否还存在：" + jedis.exists("wlist"));

    }
    /**
     * 集合类型的基本操作，无序不重复
     */
    public static void set(){
        jedis.sadd("wset", "剑圣","风行","蚂蚁","蜘蛛","火女");
        Set<String> set = jedis.smembers("wset");
        System.out.println(set);
        long length = jedis.scard("wset"); // 求集合的长度
        System.out.println("获取wset的长度：" + length);
        jedis.srem("wset", "火女");//从wset中移除火女
        System.out.println(jedis.smembers("wset"));
        System.out.println(jedis.sismember("wset", "蜘蛛"));// 判断元素是否包含在该集合中
        String spop = jedis.spop("wset");// 随机的移除spop中的一个元素，并返回它
        System.out.println("wset中被随机移除的元素是：" + spop);
        jedis.del("wset"); // 删除整个集合
    }
    /**
     * 集合之间的运算，交集、并集、差集
     */
    private static void sets() {
        Jedis jedis = jedisPool.getResource();
        jedis.flushDB(); // 清空数据库
        jedis.sadd("set1", "a", "b", "c", "d");
        jedis.sadd("set2", "b", "c", "e");

        Set<String> set = jedis.sdiff("set1", "set2"); // 求两个集合的差集（只会返回存在于1，但2不存在的）
        System.out.println("求出两个集合之间的差集：" + set); // 会输出a和d
        // 还有一个sdiffstore的api，可以把sdiff的计算结果赋值到另一个set中，下面的交集和并集也类似
        System.out.println();

        set = jedis.sinter("set1", "set2"); // 求两个集合的交集
        System.out.println("求出两个集合之间的交集：" + set); // 会输出b和c
        System.out.println();

        set = jedis.sunion("set1", "set2"); // 求两个集合的并集
        System.out.println("求出两个集合之间的并集：" + set);
        System.out.println();
        System.out.println();

        jedis.close();
    }
    /**
     * 散列的基本操作,键值对里面还有键值对，经常用来存储多个字段信息，也可以理解为存放一个map，散列是redis的存储原型
     */
    public static void map(){
        Map<String,String> map = new HashMap<String,String>();
        map.put("df", "敌法");
        map.put("dpg", "大屁股");
        map.put("kl", "骷髅");
        map.put("bn", "冰女");
        map.put("js", "剑圣");
        map.put("gf", "光法");
        jedisCluster.hmset("wmap", map);// 存放一个散列
        Map<String,String> gmap  =jedisCluster.hgetAll("wmap"); // 从redis中取回来
        System.out.println(gmap+"=====>>>>>"+gmap.toString());
        List<String> list = jedisCluster.hmget("wmap", "gf","js");
        System.out.println(list);
        jedisCluster.hdel("wmap", "js","gf");// 删除散列中的一个或者多个字段
        System.out.println(jedisCluster.hgetAll("wmap"));
        long length = jedisCluster.hlen("wmap");
        System.out.println(length);
        System.out.println(jedisCluster.hexists("wmap", "dpg"));// 判断某个字段是否存在于散列中
        Set<String> set = jedisCluster.hkeys("wmap");// 获取散列的所有字段名
        System.out.println(set);
        List<String> list1 = jedisCluster.hvals("wmap");// 获取散列的所有字段值，实质的方法实现，是用上面的hkeys后再用hmget
        System.out.println(list1);
//		jedisCluster.hincrBy("wmap", "bn",10);// 给散列的某个字段进行加法运算
        System.out.println(jedisCluster.hgetAll("wmap"));
        jedisCluster.del("wmap"); // 删除散列
        System.out.println("删除wmap后，wmap是否还存在redis中：" + jedis.exists("wmap"));
    }
    /**
     * 有序集合的基本使用，zset是set的升级版，在无序的基础上，加入了一个权重，使其有序化<br/>
     * 另一种理解，zset是hash的特殊版，一样的存放一些键值对，但这里的值只能是数字，不能是字符串<br/>
     * zset广泛应用于排名类的场景
     */
    public static void zset(){
        Map<String,Double> map = new HashMap<String,Double>();
        map.put("小黑", 22.2);
        map.put("小明", 11.23);
        map.put("小bb",45.3);
        map.put("小", 5.3);
        map.put("小黑b", 99.9);
        jedis.zadd("zset", map); // 添加一个zset
        Set<String> range = jedis.zrange("zset", 0, -1); // 从小到大排序，返回所有成员，三个参数：键、开始位置、结束位置（-1代表全部）
        // zrange方法还有很多衍生的方法，如zrangeByScore等，只是多了一些参数和筛选范围而已，比较简单，自己看看api就知道了
        System.out.println("zset返回的所有从小大到排序的成员：" + range);
        Set<String> set = jedis.zrevrange("zset", 0, -1);// 从大到小排序，类似上面的range
        System.out.println("zset从大到小："+set);
        long length = jedis.zcard("zset"); // 求有效长度
        System.out.println(length);
        long zcount = jedis.zcount("zset", 22.1, 30.0); // 求出zset中，两个成员的排名之差，注意不是求长度，
        System.out.println("zset中，22.1和30.0差了" + zcount + "名");
        long rank = jedis.zrank("zset", "小黑b");// 求出zset中某成员的排位，注意第一是从0开始的
        System.out.println(rank);
        double score = jedis.zscore("zset", "小bb");// 获取zset中某成员的值
        System.out.println(score);
        jedis.zincrby("zset", 100, "小bb"); // 给zset中的某成员做加法运算
        System.out.println("zset中小bb加10后，排名情况为：" + jedis.zrange("zset", 0, -1));
        jedis.zrem("zset", "小bb"); // 删除zset中某个成员
        System.out.println("zset中小bb加10后，排名情况为：" + jedis.zrange("zset", 0, -1));
    }
    /**
     * 有序集合的运算，交集、并集（最小、最大、总和）
     */
    public static void zsets(){
        Map<String, Double> map1 = new HashMap<String, Double>();
        map1.put("wch", 24.3); // 这里以小组成员的年龄来演示
        map1.put("lida", 30.0);
        map1.put("chf", 23.5);
        map1.put("lxl", 22.1);

        Map<String, Double> map2 = new HashMap<String, Double>();
        map2.put("wch", 24.3);
        map2.put("lly", 29.6);
        map2.put("chf", 23.5);
        map2.put("zjl", 21.3);
        jedis.flushDB();
        jedis.zadd("zset1", map1);
        jedis.zadd("zset2", map2);
        System.out.println("zset1的值有：" + jedis.zrange("zset1", 0, -1));
        System.out.println("zset2的值有：" + jedis.zrange("zset2", 0, -1));
        System.out.println("zset1的值有：" + jedis.zrangeWithScores("zset1", 0, -1));
        System.out.println("zset2的值有：" + jedis.zrangeWithScores("zset2", 0, -1));
        jedis.zinterstore("zset_inter", "zset1", "zset2"); // 把两个集合进行交集运算，运算结果赋值到zset_inter中
        System.out.println(jedis.zinterstore("zset_inter", "zset1", "zset2"));
        System.out.println("看看两个zset交集运算结果：" + jedis.zrangeWithScores("zset_inter", 0, -1));
        jedis.zunionstore("zset_union", "zset1", "zset2");// 把两个集合进行并集运算，运算结果赋值到zset_union中
        System.out.println("看看两个zset并集运算结果：" + jedis.zrangeWithScores("zset_union", 0, -1));
        System.out.println("可以看出，zset的交集和并集计算，默认会把两个zset的score相加");
        ZParams zParams = new ZParams();
        zParams.aggregate(ZParams.Aggregate.MAX);
        jedis.zinterstore("zset_inter", zParams, "zset1", "zset2"); // 通过指定ZParams来设置集合运算的score处理，有MAX MIN SUM三个可以选择，默认是SUM
        System.out.println("看看两个zset交集max运算结果：" + jedis.zrangeWithScores("zset_inter", 0, -1));

        //zrangeWithScores返回的是一个Set<Tuple>类型，如果直接把这个集合打印出来，会把zset的key转成ascii码，看起来不直观，建议还是使用foreach之类的遍历会好看一些
    }
    /**
     * 发布消息，类似于mq的生产者
     */
    private static void publisher() {

        new Thread() {
            public void run() {
                try {
                    Thread.sleep(1000); // 休眠一下，让订阅者有充足的时间去连上
//                    Jedis jedis = jedisPool.getResource();
                    jedis.flushAll();

                    for (int i = 0; i < 10; i++) {
                        jedis.publish("channel", "要发送的消息内容" + i); // 每隔一秒推送一条消息
                        System.out.printf("成功向channel推送消息：%s\n", i);
                        Thread.sleep(1000);
                    }

                    jedis.close();

                } catch (Exception e) {
                    e.printStackTrace();
                }

            };
        }.start();
    }
    /**
     * 订阅消息，类似与mq的消费者
     *
     */
    private static void subscribe(){
//        Jedis jedis = jedisPool.getResource();
        jedis.flushAll();
        JedisListener listener = new JedisListener();
        System.out.println(jedis.getClient().getHost()+":"+jedis.getClient().getPort());
        System.out.println(jedis.getClient().getConnectionTimeout());
        System.out.println("-----1----------");
        System.out.println(jedis.getClient().getRawObjectMultiBulkReply().get(0));
        System.out.println("------2---------");
        listener.proceed(jedis.getClient(), "channel"); // 开始监听channel频道的消息
        //listener.unsubscribe(); //取消监听
        jedis.close();
    }
    /**
     * 重写监听器的一些重要方法，JedisPubSub里面的这些回调方法都是空的，不重写就什么事都不会发生
     *
     * @author Kazz
     *
     */
    public static class JedisListener extends JedisPubSub {
        /**
         * 收到消息后的回调
         */
        @Override
        public void onMessage(String channel, String message) {
            System.out.println("onMessage: 收到频道[" + channel + "]的消息[" + message + "]");
        }

        @Override
        public void onPMessage(String pattern, String channel, String message) {
            System.out.println("onPMessage: channel[" + channel + "], message[" + message + "]");
        }

        /**
         * 成功订阅频道后的回调
         */
        @Override
        public void onSubscribe(String channel, int subscribedChannels) {
            System.out
                    .println("onSubscribe: 成功订阅[" + channel + "]," + "subscribedChannels[" + subscribedChannels + "]");
        }

        /**
         * 取消订阅频道的回调
         */
        @Override
        public void onUnsubscribe(String channel, int subscribedChannels) {
            System.out.println(
                    "onUnsubscribe: 成功取消订阅[" + channel + "], " + "subscribedChannels[" + subscribedChannels + "]");
        }

        @Override
        public void onPUnsubscribe(String pattern, int subscribedChannels) {
            System.out.println(
                    "onPUnsubscribe: pattern[" + pattern + "]," + "subscribedChannels[" + subscribedChannels + "]");
        }

        @Override
        public void onPSubscribe(String pattern, int subscribedChannels) {
            System.out.println(
                    "onPSubscribe: pattern[" + pattern + "], " + "subscribedChannels[" + subscribedChannels + "]");
        }
    }

}

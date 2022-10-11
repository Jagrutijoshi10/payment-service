# rename docker file
sed -i 's/staging/stage2/g;s/stage1/stage2/g;s/stage3/stage2/g;s/stage4/stage2/g;' dockerfile
# generate image
docker build -t stage2_umobile_app_payment_management .
# tag image
docker tag stage2_umobile_app_payment_management asia.gcr.io/um-stage-2/stage2_umobile_app_payment_management:v$1
# push image
docker push asia.gcr.io/um-stage-2/stage2_umobile_app_payment_management:v$1